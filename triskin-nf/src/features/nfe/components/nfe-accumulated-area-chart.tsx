import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { nfeChartTick, nfeChartTooltipStyles } from '../lib/chart-theme';

type Datum = { dia: string; acumulado: number };

type Props = {
	data: Datum[];
	title: string;
	description: string;
	emptyHint: string;
};

export function NfeAccumulatedAreaChart({
	data,
	title,
	description,
	emptyHint,
}: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base text-zinc-100">{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="h-[300px] pt-2">
				{data.length > 0 ? (
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
							<defs>
								<linearGradient id="fillAcum" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
									<stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid
								strokeDasharray="3 3"
								className="stroke-zinc-800"
								vertical={false}
							/>
							<XAxis
								dataKey="dia"
								tick={nfeChartTick}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis tick={nfeChartTick} tickLine={false} axisLine={false} width={36} />
							<Tooltip {...nfeChartTooltipStyles} />
							<Area
								type="monotone"
								dataKey="acumulado"
								stroke="#a78bfa"
								strokeWidth={2}
								fill="url(#fillAcum)"
								name="Total acumulado"
							/>
						</AreaChart>
					</ResponsiveContainer>
				) : (
					<p className="text-sm text-zinc-500">{emptyHint}</p>
				)}
			</CardContent>
		</Card>
	);
}
