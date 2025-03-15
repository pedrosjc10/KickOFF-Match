import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity("local")
export class Local extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column()
  endereco!: string;

  @Column()
  tipo!: string;

  @Column()
  modalidade!: string;
}
