
import { supabase } from '../src/lib/supabase';

async function checkSchema() {
  const { data, error } = await supabase
    .from('Product')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching product:', error);
  } else {
    console.log('Product columns:', Object.keys(data[0] || {}));
  }
}

checkSchema();
