# Guia de Setup com Docker

Este guia contém as instruções para instalar o Docker e rodar o projeto **Verdear** utilizando o ambiente de containers.

---

## 1. Instalação do Docker

Para rodar este projeto, você precisa ter o Docker instalado (ele já inclui o plugin do Docker Compose V2 por padrão nas versões recentes).

### Windows / Mac
1. Acesse o site oficial: [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Baixe a versão correspondente ao seu sistema operacional.
3. Siga o instalador (no Windows, certifique-se de que o recurso **WSL2** esteja ativado, se solicitado).
4. Reinicie o computador após a instalação.

### Linux (Ubuntu/Debian)
Execute os comandos abaixo no terminal:
```bash
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo systemctl enable --now docker

# Para rodar comandos do Docker sem precisar de "sudo" (opcional):
sudo usermod -aG docker $USER
```
*(Se você adicionar o usuário ao grupo docker, precisará reiniciar a sessão no Linux para a mudança fazer efeito).*

---

## 2. Como Rodar o Projeto

Com o Docker instalado, siga os passos abaixo:

1. **Abra o terminal** na raiz do projeto.
2. **Suba os containers:**
   ```bash
   docker compose up --build
   ```
   *O parâmetro `--build` garante que o Docker atualize a sua imagem sempre que houver alterações no código do backend.*

3. **Acesse a aplicação:**
   Abra o seu navegador e acesse: [http://localhost:3000](http://localhost:3000)

4. **Para parar a execução:**
   Pressione `Ctrl + C` no terminal onde os logs estão rodando. Para desligar e remover os containers corretamente, execute:
   ```bash
   docker compose down
   ```

---

## Notas Importantes

* **Persistência de Dados:** Os dados do banco de dados não são perdidos ao desligar o container, pois estão salvos no volume `pgdata`.
* **Migration Inicial:** O arquivo `migration.sql` na raiz será executado automaticamente na primeira vez que o banco subir, criando suas tabelas e dados iniciais.
* **Saúde do Banco:** A aplicação Node.js (`verdear`) só iniciará após o banco de dados estar totalmente pronto para receber conexões.
