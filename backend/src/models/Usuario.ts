import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, OneToMany } from "typeorm";
import bcrypt from "bcrypt";
import { PartidaUsuario } from "./PartidaUsuario";

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

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.senha && !this.senha.startsWith("$2b$")) {
      this.senha = await bcrypt.hash(this.senha, 10);
    }
  }
  
  @OneToMany(() => PartidaUsuario, (partidaUsuario) => partidaUsuario.usuario)
partidaUsuarios!: PartidaUsuario[];

}
