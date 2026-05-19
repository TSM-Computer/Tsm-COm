/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'user';

export interface FuelEntry {
  id: string;
  date: string; // ISO string
  amount: number;
  note?: string;
  trip_type: 'daily' | 'round-trip';
  trips?: number;
}

export interface Stats {
  weeklyAverage: number;
  monthlyAverage: number;
  totalThisMonth: number;
}
