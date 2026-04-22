import {
	Bar,
	BarChart,
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
import type { StatusBarDatum } from '../lib/bar-chart-status-data';

type Props = {
	data: StatusBarDatum[];
	title: string;
	description: string;
};

export function NfeStatusBarChart({ data, title, description }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base text-zinc-100">{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="h-[300px] pt-2">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
						<CartesianGrid
							strokeDasharray="3 3"
							className="stroke-zinc-800"
							vertical={false}
						/>
						<XAxis
							dataKey="status"
							tick={nfeChartTick}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							allowDecimals={false}
							tick={nfeChartTick}
							tickLine={false}
							axisLine={false}
							width={36}
						/>
						<Tooltip {...nfeChartTooltipStyles} />
						<Bar dataKey="quantidade" radius={[6, 6, 0, 0]} fill="#8b5cf6" name="Quantidade" />
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
