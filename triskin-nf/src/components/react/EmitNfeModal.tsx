import { useCallback, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { parseNestApiError } from '@/lib/parse-nest-api-error';
import { buildCreateNfePayload } from '@/features/nfe/lib/build-create-nfe-payload';

type ItemForm = {
	key: string;
	codigoProduto: string;
	quantidade: string;
	valorUnitario: string;
	cfop: string;
	cst: string;
};

function newItem(): ItemForm {
	return {
		key: crypto.randomUUID(),
		codigoProduto: 'P001',
		quantidade: '1',
		valorUnitario: '100.50',
		cfop: '5102',
		cst: '00',
	};
}

const SEED_CNPJ = '11222333000181';
const SEED_IE = '123456789011';
const SEED_UF = 'SP';

type EmitNfeModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
};

export function EmitNfeModal({ open, onOpenChange, onSuccess }: EmitNfeModalProps) {
	const [cnpjDestinatario, setCnpjDestinatario] = useState(SEED_CNPJ);
	const [ieDestinatario, setIeDestinatario] = useState(SEED_IE);
	const [ufDestinatario, setUfDestinatario] = useState(SEED_UF);
	const [itens, setItens] = useState<ItemForm[]>(() => [newItem()]);
	const [busy, setBusy] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const resetForm = useCallback(() => {
		setCnpjDestinatario(SEED_CNPJ);
		setIeDestinatario(SEED_IE);
		setUfDestinatario(SEED_UF);
		setItens([newItem()]);
		setFormError(null);
	}, []);

	const addItem = useCallback(() => {
		setItens((prev) => [...prev, newItem()]);
	}, []);

	const removeItem = useCallback((key: string) => {
		setItens((prev) => (prev.length <= 1 ? prev : prev.filter((i) => i.key !== key)));
	}, []);

	const updateItem = useCallback(
		(key: string, patch: Partial<Omit<ItemForm, 'key'>>) => {
			setItens((prev) =>
				prev.map((i) => (i.key === key ? { ...i, ...patch } : i)),
			);
		},
		[],
	);

	const handleSubmit = useCallback(async () => {
		setFormError(null);
		const built = buildCreateNfePayload(cnpjDestinatario, ieDestinatario, ufDestinatario, itens);
		if (!built.ok) {
			setFormError(built.error);
			return;
		}
		const payload = built.payload;

		setBusy(true);
		try {
			const res = await fetch('/api/nfe', {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const text = await res.text();
			if (res.status === 401) {
				window.location.replace('/');
				return;
			}
			if (!res.ok) {
				setFormError(parseNestApiError(text, 'Não foi possível emitir a NF-e.'));
				return;
			}
			onOpenChange(false);
			resetForm();
			onSuccess?.();
		} catch {
			setFormError('Falha de rede ao emitir.');
		} finally {
			setBusy(false);
		}
	}, [
		cnpjDestinatario,
		ieDestinatario,
		ufDestinatario,
		itens,
		onOpenChange,
		onSuccess,
		resetForm,
	]);

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				if (!v) resetForm();
				onOpenChange(v);
			}}
		>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Nova NF-e</DialogTitle>
					<DialogDescription>
						Destinatário do seed ERP (CNPJ {SEED_CNPJ}) e produtos{' '}
						<code className="text-violet-300">P001</code> /{' '}
						<code className="text-violet-300">P002</code>. A nota entra na fila de
						emissão após enviar.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-2">
					<div className="grid gap-4 sm:grid-cols-3">
						<div className="space-y-2 sm:col-span-1">
							<Label htmlFor="nfe-cnpj">CNPJ destinatário</Label>
							<Input
								id="nfe-cnpj"
								value={cnpjDestinatario}
								onChange={(e) => setCnpjDestinatario(e.target.value)}
								autoComplete="off"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="nfe-ie">IE</Label>
							<Input
								id="nfe-ie"
								value={ieDestinatario}
								onChange={(e) => setIeDestinatario(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="nfe-uf">UF</Label>
							<Input
								id="nfe-uf"
								value={ufDestinatario}
								onChange={(e) => setUfDestinatario(e.target.value.toUpperCase())}
								maxLength={2}
							/>
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<Label className="text-zinc-200">Itens</Label>
							<Button type="button" variant="outline" size="sm" onClick={addItem}>
								<Plus className="size-4" aria-hidden />
								Adicionar item
							</Button>
						</div>

						<div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
							{itens.map((row, idx) => (
								<div
									key={row.key}
									className={cn(
										'grid gap-3 border-b border-zinc-800 pb-3 last:border-0 last:pb-0 sm:grid-cols-12',
									)}
								>
									<p className="text-xs text-zinc-500 sm:col-span-12">
										Item {idx + 1}
									</p>
									<div className="space-y-1 sm:col-span-2">
										<span className="text-xs text-zinc-500">Produto</span>
										<Input
											value={row.codigoProduto}
											onChange={(e) =>
												updateItem(row.key, { codigoProduto: e.target.value })
											}
											placeholder="P001"
										/>
									</div>
									<div className="space-y-1 sm:col-span-2">
										<span className="text-xs text-zinc-500">Qtd</span>
										<Input
											value={row.quantidade}
											onChange={(e) =>
												updateItem(row.key, { quantidade: e.target.value })
											}
										/>
									</div>
									<div className="space-y-1 sm:col-span-2">
										<span className="text-xs text-zinc-500">V. unit.</span>
										<Input
											value={row.valorUnitario}
											onChange={(e) =>
												updateItem(row.key, { valorUnitario: e.target.value })
											}
										/>
									</div>
									<div className="space-y-1 sm:col-span-2">
										<span className="text-xs text-zinc-500">CFOP</span>
										<Input
											value={row.cfop}
											onChange={(e) =>
												updateItem(row.key, { cfop: e.target.value })
											}
											maxLength={4}
										/>
									</div>
									<div className="space-y-1 sm:col-span-2">
										<span className="text-xs text-zinc-500">CST</span>
										<Input
											value={row.cst}
											onChange={(e) =>
												updateItem(row.key, { cst: e.target.value })
											}
											maxLength={3}
										/>
									</div>
									<div className="flex items-end justify-end sm:col-span-2">
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
											disabled={itens.length <= 1}
											onClick={() => removeItem(row.key)}
											aria-label={`Remover item ${idx + 1}`}
										>
											<Trash2 className="size-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>

					{formError ? (
						<p
							className="rounded-md border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-200"
							role="alert"
						>
							{formError}
						</p>
					) : null}
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						disabled={busy}
						onClick={() => onOpenChange(false)}
					>
						Cancelar
					</Button>
					<Button type="button" disabled={busy} onClick={() => void handleSubmit()}>
						{busy ? 'Emitindo…' : 'Emitir NF-e'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
