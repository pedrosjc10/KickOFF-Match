import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, OneToMany } from "typeorm";
import bcrypt from "bcrypt";
import { Partida } from "./Partida";

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;
  
  @Column()
  email!: string;

  @Column()
  cpf!: string;

  @Column()
  senha!: string;

  @Column()
  overall!: number;

  @Column()
  posicao: boolean = false;

  @Column()
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
