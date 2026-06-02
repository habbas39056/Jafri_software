'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function addCashbookEntry(formData: FormData) {
  try {
    const rawAmount = formData.get('amount') as string;
    const amount = parseFloat(rawAmount || '0');
    
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Amount must be a positive number.");
    }

    const data = {
      date: formData.get('date') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      transaction_type: formData.get('transaction_type') as string, // 'IN' or 'OUT'
      amount: amount,
      reference: formData.get('reference') as string || null
    };

    const { error } = await supabase
      .from('Cashbook')
      .insert([data]);

    if (error) {
      console.error("Error adding cashbook entry:", error);
      throw new Error(error.message || "Failed to add transaction.");
    }

    revalidatePath('/cashbook');
    return { success: true };
  } catch (error: any) {
    console.error("Action error:", error);
    return { success: false, error: error.message || "Something went wrong." };
  }
}
