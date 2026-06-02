'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function addEmployee(formData: FormData) {
  try {
    // Process checked modules
    const modules: string[] = [];
    if (formData.get('mod_dashboard')) modules.push('Dashboard');
    if (formData.get('mod_invoices')) modules.push('Invoices');
    if (formData.get('mod_customers')) modules.push('Customers');
    if (formData.get('mod_products')) modules.push('Products');
    if (formData.get('mod_cashbook')) modules.push('Cashbook');
    if (formData.get('mod_reports')) modules.push('Reports');
    if (formData.get('mod_purchase_orders')) modules.push('Purchase Orders');
    if (formData.get('mod_production')) modules.push('Production');
    if (formData.get('mod_delivery')) modules.push('Delivery');
    if (formData.get('mod_payments')) modules.push('Payments');
    if (formData.get('mod_warranty')) modules.push('Warranty');

    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as string,
      modules: modules
    };

    // Note: Since DB is mocked, this will just return successful with empty array
    const { error } = await supabase
      .from('Employee')
      .insert([data]);

    if (error) {
      console.error("Error adding employee:", error);
      throw new Error(error.message || "Failed to add employee.");
    }

    revalidatePath('/employees');
    return { success: true };
  } catch (error: any) {
    console.error("Action error:", error);
    return { success: false, error: error.message || "Something went wrong." };
  }
}
