import Sequelize from "sequelize";
import sequelize from "../core/database.js"; // Conexão com o banco de dados
import AvaliacaoModel from "./avaliacao.js";
import CategoriaModel from "./categoria.js";
import PessoaModel from "./pessoa.js";
// Importação dos modelos
import ProdutoModel from "./produto.js";
import UnidadeMedidaModel from "./unidademedida.js";
import VendaModel from "./venda.js";
import VendaProdutoModel from "./vendaproduto.js";

// Inicialização dos modelos
const Produto = ProdutoModel(sequelize, Sequelize);
const Pessoa = PessoaModel(sequelize, Sequelize);
const Avaliacao = AvaliacaoModel(sequelize, Sequelize);
const Venda = VendaModel(sequelize, Sequelize);
const VendaProduto = VendaProdutoModel(sequelize, Sequelize);
const Categoria = CategoriaModel(sequelize, Sequelize);
const UnidadeMedida = UnidadeMedidaModel(sequelize, Sequelize);

// Exportação de todos os modelos para uso nos controllers
export {
	Avaliacao,
	Categoria,
	Pessoa,
	Produto,
	UnidadeMedida,
	Venda,
	VendaProduto,
};

// Exportação da instância do Sequelize
export default sequelize;
