import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column("decimal", { precision: 5, scale: 2 })
  price: number;

  @Column("int")
  quantity: number;

  @Column({ nullable: true })
  imageUrl: string;
}
