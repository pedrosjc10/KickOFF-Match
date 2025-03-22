import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm";
import { Partida } from "./Partida";

@Entity("tipopartida")
export class TipoPartida extends BaseEntity {
  @PrimaryGeneratedColumn()
  idtipoPartida!: number;

  @Column()
  nomeTipoPartida!: string;

  @Column()
  quantidadeJogadores!: number;

  // Relação inversa com Partida
  @OneToMany(() => Partida, (partida) => partida.tipoPartida)
  partidas!: Partida[];
}
