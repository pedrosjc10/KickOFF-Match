import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, OneToMany } from "typeorm";
import bcrypt from "bcrypt";
import { Partida } from "./Partida";

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

  @Column({ type: "boolean", default: false })
  posicao: boolean = false;

  @Column({ type: "boolean", default: false })
  tipo: boolean = false;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.senha && !this.senha.startsWith("$2b$")) {
      this.senha = await bcrypt.hash(this.senha, 10);
    }
  }

  // Relação inversa com Partida
  @OneToMany(() => Partida, (partida) => partida.usuario)
  partidas!: Partida[];
}
