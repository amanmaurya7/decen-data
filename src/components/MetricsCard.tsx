
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  className?: string;
}

const MetricsCard = ({ title, value, description, icon, className = "" }: MetricsCardProps) => {
  return (
    <Card className={`professional-card card-hover ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</CardTitle>
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-primary flex items-center justify-center shadow-lg">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-2">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
