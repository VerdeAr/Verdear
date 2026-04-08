import Sequelize from "sequelize";

const { DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_DATABASE } = process.env;

const sequelize = new Sequelize(DB_DATABASE, DB_USER, DB_PASS, {
	host: DB_HOST,
	dialect: "postgres",
	port: DB_PORT,
});

export default sequelize;
