
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
    <Card className={`gradient-border glass-effect card-hover ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold text-gray-300 uppercase tracking-wide">{title}</CardTitle>
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blockchain-purple/20 to-blockchain-teal/20 text-blockchain-purple flex items-center justify-center shadow-lg">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
          {value}
        </div>
        {description && (
          <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
