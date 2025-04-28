export default async function handler(req, res) {
  try {
    // Aqui depois vamos puxar dados do Google Sheets
    res.status(200).json({ status: 'success', data: 'Aqui vão vir as vendas!' });
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}
