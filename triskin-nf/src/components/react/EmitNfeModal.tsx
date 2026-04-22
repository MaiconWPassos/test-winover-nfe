import { useCallback, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
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
	codigoProduto: string;
	quantidade: string;
	valorUnitario: string;
	cfop: string;
	cst: string;
};

function newItem(): ItemForm {
	return {
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
const CNPJ_MASKED_LENGTH = 18;

type EmitNfeFormValues = {
	cnpjDestinatario: string;
	ieDestinatario: string;
	ufDestinatario: string;
	itens: ItemForm[];
};

function toDigits(value: string): string {
	return value.replace(/\D/g, '');
}

function formatCnpj(value: string): string {
	const digits = toDigits(value).slice(0, 14);
	if (digits.length <= 2) return digits;
	if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
	if (digits.length <= 8) {
		return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
	}
	if (digits.length <= 12) {
		return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
	}
	return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function isValidCnpj(value: string): boolean {
	const digits = toDigits(value);
	if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) {
		return false;
	}

	const calc = (base: string, factors: number[]) => {
		let sum = 0;
		for (let i = 0; i < factors.length; i += 1) {
			sum += Number(base[i]) * factors[i];
		}
		const mod = sum % 11;
		return mod < 2 ? 0 : 11 - mod;
	};

	const base12 = digits.slice(0, 12);
	const d1 = calc(base12, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
	const base13 = base12 + String(d1);
	const d2 = calc(base13, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
	return digits === base13 + String(d2);
}

function createDefaultValues(): EmitNfeFormValues {
	return {
		cnpjDestinatario: formatCnpj(SEED_CNPJ),
		ieDestinatario: SEED_IE,
		ufDestinatario: SEED_UF,
		itens: [newItem()],
	};
}

type EmitNfeModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
};

export function EmitNfeModal({ open, onOpenChange, onSuccess }: EmitNfeModalProps) {
	const [formError, setFormError] = useState<string | null>(null);

	const {
		control,
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<EmitNfeFormValues>({
		defaultValues: createDefaultValues(),
	});
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'itens',
	});

	const resetForm = useCallback(() => {
		reset(createDefaultValues());
		setFormError(null);
	}, [reset, setFormError]);

	const addItem = useCallback(() => {
		append(newItem());
	}, [append]);

	const onSubmit = useCallback(async (values: EmitNfeFormValues) => {
		setFormError(null);
		const built = buildCreateNfePayload(
			values.cnpjDestinatario,
			values.ieDestinatario,
			values.ufDestinatario,
			values.itens,
		);
		if (!built.ok) {
			setFormError(built.error);
			return;
		}
		const payload = built.payload;

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
		}
	}, [onOpenChange, onSuccess, resetForm, setFormError]);

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				if (!v) resetForm();
				onOpenChange(v);
			}}
		>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
				<form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
				<DialogHeader>
					<DialogTitle>Nova NF-e</DialogTitle>
					<DialogDescription>
						Destinatário do seed ERP (CNPJ {formatCnpj(SEED_CNPJ)}) e produtos{' '}
						<code className="text-violet-300">P001</code> /{' '}
						<code className="text-violet-300">P002</code>. A nota entra na fila de
						emissão após enviar.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-2">
					<div className="grid gap-4 sm:grid-cols-3">
						<div className="space-y-2 sm:col-span-1">
							<Label htmlFor="nfe-cnpj">CNPJ destinatário</Label>
							<Controller
								control={control}
								name="cnpjDestinatario"
								rules={{
									required: 'Informe o CNPJ do destinatário.',
									validate: (value) =>
										isValidCnpj(value) || 'Informe um CNPJ válido.',
								}}
								render={({ field }) => (
									<Input
										id="nfe-cnpj"
										value={field.value}
										onChange={(e) => field.onChange(formatCnpj(e.target.value))}
										autoComplete="off"
										placeholder="00.000.000/0000-00"
										maxLength={CNPJ_MASKED_LENGTH}
									/>
								)}
							/>
							{errors.cnpjDestinatario ? (
								<p className="text-xs text-rose-300" role="alert">
									{errors.cnpjDestinatario.message}
								</p>
							) : null}
						</div>
						<div className="space-y-2">
							<Label htmlFor="nfe-ie">IE</Label>
							<Input
								id="nfe-ie"
								{...register('ieDestinatario', {
									required: 'Informe a inscrição estadual.',
									validate: (value) =>
										value.trim().length > 0 ||
										'Informe a inscrição estadual.',
								})}
							/>
							{errors.ieDestinatario ? (
								<p className="text-xs text-rose-300" role="alert">
									{errors.ieDestinatario.message}
								</p>
							) : null}
						</div>
						<div className="space-y-2">
							<Label htmlFor="nfe-uf">UF</Label>
							<Input
								id="nfe-uf"
								{...register('ufDestinatario', {
									required: 'Informe a UF.',
									pattern: {
										value: /^[A-Za-z]{2}$/,
										message: 'UF deve conter 2 letras.',
									},
									onChange: (e) => {
										setValue('ufDestinatario', e.target.value.toUpperCase());
									},
								})}
								maxLength={2}
							/>
							{errors.ufDestinatario ? (
								<p className="text-xs text-rose-300" role="alert">
									{errors.ufDestinatario.message}
								</p>
							) : null}
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
							{fields.map((row, idx) => (
								<div
									key={row.id}
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
											{...register(`itens.${idx}.codigoProduto`, {
												required: 'Informe o código do produto.',
											})}
											placeholder="P001"
										/>
										{errors.itens?.[idx]?.codigoProduto ? (
											<p className="text-xs text-rose-300" role="alert">
												{errors.itens[idx]?.codigoProduto?.message}
											</p>
										) : null}
									</div>
									<div className="space-y-1 sm:col-span-2">
										<span className="text-xs text-zinc-500">Qtd</span>
										<Input
											{...register(`itens.${idx}.quantidade`, {
												required: 'Informe a quantidade.',
												validate: (value) =>
													Number(String(value).replace(',', '.')) > 0 ||
													'Quantidade deve ser maior que zero.',
											})}
										/>
										{errors.itens?.[idx]?.quantidade ? (
											<p className="text-xs text-rose-300" role="alert">
												{errors.itens[idx]?.quantidade?.message}
											</p>
										) : null}
									</div>
									<div className="space-y-1 sm:col-span-2">
										<span className="text-xs text-zinc-500">V. unit.</span>
										<Input
											{...register(`itens.${idx}.valorUnitario`, {
												required: 'Informe o valor unitário.',
												validate: (value) =>
													Number(String(value).replace(',', '.')) > 0 ||
													'Valor unitário deve ser maior que zero.',
											})}
										/>
										{errors.itens?.[idx]?.valorUnitario ? (
											<p className="text-xs text-rose-300" role="alert">
												{errors.itens[idx]?.valorUnitario?.message}
											</p>
										) : null}
									</div>
									<div className="space-y-1 sm:col-span-2">
										<span className="text-xs text-zinc-500">CFOP</span>
										<Input
											{...register(`itens.${idx}.cfop`, {
												required: 'Informe o CFOP.',
												pattern: {
													value: /^\d{4}$/,
													message: 'CFOP deve ter 4 dígitos.',
												},
											})}
											maxLength={4}
										/>
										{errors.itens?.[idx]?.cfop ? (
											<p className="text-xs text-rose-300" role="alert">
												{errors.itens[idx]?.cfop?.message}
											</p>
										) : null}
									</div>
									<div className="space-y-1 sm:col-span-2">
										<span className="text-xs text-zinc-500">CST</span>
										<Input
											{...register(`itens.${idx}.cst`, {
												required: 'Informe o CST.',
												pattern: {
													value: /^\d{2,3}$/,
													message: 'CST deve ter 2 ou 3 dígitos.',
												},
											})}
											maxLength={3}
										/>
										{errors.itens?.[idx]?.cst ? (
											<p className="text-xs text-rose-300" role="alert">
												{errors.itens[idx]?.cst?.message}
											</p>
										) : null}
									</div>
									<div className="flex items-end justify-end sm:col-span-2">
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
											disabled={fields.length <= 1}
											onClick={() => remove(idx)}
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
						disabled={isSubmitting}
						onClick={() => onOpenChange(false)}
					>
						Cancelar
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Emitindo…' : 'Emitir NF-e'}
					</Button>
				</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
