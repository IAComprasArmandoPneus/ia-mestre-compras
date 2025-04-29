export default function handler(req, res) {
  res.status(200).json({
    status: 'success',
    data: 'Aqui vão vir as vendas!'
  });
}
