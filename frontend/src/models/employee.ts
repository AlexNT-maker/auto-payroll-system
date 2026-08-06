export interface Employee {
  id: number;
  name: string;
  daily_wage: number;
  overtime_rate: number;
  bank_daily_amount: number;
  tempPresent?: boolean;
  tempHalfDay?: boolean;
  tempBoat?: string;
  tempOtBoat?: string;    
  tempOvertime?: string;
}