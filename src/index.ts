import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Product } from "./entity/Product";

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir });

createConnection().then(async connection => {
  const productRepository = connection.getRepository(Product);
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.post("/login", (req, res) => {
    const { name, password } = req.body;

    if (name === 'admin' && password === 'admin123') {
      return res.send({ message: "Login bem-sucedido" });
    } else {
      return res.status(401).send({ error: "Credenciais inválidas" });
    }
  });

  app.post("/products", upload.single('image'), async (req, res) => {
    const { name, brand, price, quantity } = req.body;
    const product = productRepository.create({
      name,
      brand,
      price,
      quantity,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null
    });
    const result = await productRepository.save(product);
    return res.send(result);
  });

  app.get("/products", async (req, res) => {
    const products = await productRepository.find();
    return res.send(products);
  });

  app.get("/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (!isNaN(id)) {
      const result = await productRepository.findOne({ where: { id: id } });
      if (result) {
        res.send(result);
      } else {
        res.status(404).send("Produto não encontrado");
      }
    } else {
      res.status(400).send("ID inválido");
    }
  });

  app.put("/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (!isNaN(id)) {
      const product = await productRepository.findOne({ where: { id: id } });
      if (product) {
        productRepository.merge(product, req.body);
        const result = await productRepository.save(product);
        return res.send(result);
      } else {
        return res.status(404).send("Produto não encontrado");
      }
    } else {
      res.status(400).send("ID inválido");
    }
  });

  app.delete("/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (!isNaN(id)) {
      const result = await productRepository.delete(id);
      if (result.affected === 1) {
        res.send({ message: "Produto deletado com sucesso" });
      } else {
        res.status(404).send("Produto não encontrado para deletar");
      }
    } else {
      res.status(400).send("ID inválido");
    }
  });

  app.use('/uploads', express.static(uploadDir));

  app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
  });
}).catch(error => console.log(error));
