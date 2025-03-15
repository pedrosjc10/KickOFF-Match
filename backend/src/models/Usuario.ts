import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  nome!: string;

  @Column({ type: "varchar", length: 14, unique: true })
  cpf!: string;

  @Column({ type: "varchar", length: 255 })
  senha!: string;

  @Column({ type: "int", default: 0 })
  overall!: number;

  @Column({ type: "date", nullable: true })
  nascimento?: Date;

  @Column({ type: "boolean", default: false })
  tipo: boolean = false;

}
