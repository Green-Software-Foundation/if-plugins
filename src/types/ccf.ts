
// consumption information for a single instance
export type IConsumption = {
  idle?: number;
  tenPercent?: number;
  fiftyPercent?: number;
  hundredPercent?: number;
  minWatts?: number;
  maxWatts?: number;
} // information about a single compute instance

export type IComputeInstance = {
  consumption: IConsumption;
  embodiedEmission?: number;
  name: string;
  vCPUs?: number;
  maxVCPUs?: number;
}

export type ICcfResult = {
  energy: number;
  embodied_emissions: number;
}