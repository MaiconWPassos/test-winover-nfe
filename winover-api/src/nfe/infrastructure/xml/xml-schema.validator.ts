import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { execFile } from 'node:child_process';
import { access, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

@Injectable()
export class XmlSchemaValidator {
  private readonly logger = new Logger(XmlSchemaValidator.name);

  private resolveSchemaPath(): string {
    return join(__dirname, '..', '..', 'resources', 'nfe-mock.xsd');
  }

  async assertValidAgainstNfeMockSchema(xml: string): Promise<void> {
    const schemaPath = this.resolveSchemaPath();
    try {
      await access(schemaPath);
    } catch {
      throw new BadRequestException(
        'Schema XSD não encontrado no build (verifique assets do nest-cli).',
      );
    }

    const dir = await mkdtemp(join(tmpdir(), 'nfe-xsd-'));
    const xmlPath = join(dir, 'nfe.xml');
    await writeFile(xmlPath, xml, 'utf8');

    try {
      await execFileAsync(
        'xmllint',
        ['--noout', '--schema', schemaPath, xmlPath],
        { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 },
      );
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as NodeJS.ErrnoException).code === 'ENOENT'
      ) {
        this.logger.warn(
          'xmllint não encontrado no PATH — validação XSD ignorada (use Docker/Linux ou instale libxml2-utils)',
        );
        return;
      }

      const stderr =
        err && typeof err === 'object' && 'stderr' in err
          ? String((err as { stderr?: string }).stderr ?? '')
          : '';
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn({ stderr, message }, 'Falha na validação XSD');
      throw new BadRequestException({
        message: 'XML inválido frente ao schema (XSD)',
        details: stderr || message,
      });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }
}
