import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CustomersModule } from '../customers/customers.module';
import { ProductsModule } from '../products/products.module';
import { ErpFicticioService } from './erp/erp-ficticio.service';
import { NfeItem } from './entities/nfe-item.entity';
import { Nfe } from './entities/nfe.entity';
import { NfeXmlBuilder } from './infrastructure/xml/nfe-xml.builder';
import { XmlSchemaValidator } from './infrastructure/xml/xml-schema.validator';
import { NfeEmissionHandler } from './nfe-emission.handler';
import { NfeRetornoSefazService } from './nfe-retorno-sefaz.service';
import { NfeQueueService } from './nfe-queue.service';
import { NfeController } from './nfe.controller';
import { NfeService } from './nfe.service';
import { NfeRepository } from './repository/nfe.repository';
import { SefazMockService } from './sefaz/sefaz-mock.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Nfe, NfeItem]),
    CustomersModule,
    ProductsModule,
    AuthModule,
  ],
  controllers: [NfeController],
  providers: [
    NfeRepository,
    NfeService,
    ErpFicticioService,
    NfeXmlBuilder,
    XmlSchemaValidator,
    SefazMockService,
    NfeRetornoSefazService,
    NfeEmissionHandler,
    NfeQueueService,
  ],
  exports: [NfeService, NfeRetornoSefazService],
})
export class NfeModule {}
