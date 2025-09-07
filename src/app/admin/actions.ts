"use server";

import { createClient } from "@supabase/supabase-js";

// Este cliente é criado com a chave de serviço e SÓ PODE SER USADO NO SERVIDOR.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Busca o número total de usuários cadastrados de forma segura.
 * @returns O número total de usuários.
 */
export async function getUserCount() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error("Erro ao buscar contagem de usuários:", error.message);
    // Retorna 0 em caso de erro para não quebrar a interface.
    // Em um cenário real, você poderia tratar o erro de forma mais específica.
    return 0;
  }

  return data.users.length;
}
