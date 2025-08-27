import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm";
import { Partida } from "./Partida";

@Entity("tipopartida")
export class TipoPartida extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'idtipopartida' }) // <-- Correção: Especifica o nome real da coluna no banco
  idtipoPartida!: number;

  @Column({name : 'nomeTipoPartida'}) // <-- Correção: Especifica o nome real da coluna no banco
  nomeTipoPartida!: string;

  @Column({ name: 'quantidadeJogadores' }) // <-- Correção: Especifica o nome real da coluna no banco
  quantidadeJogadores!: number;

  // Relação inversa com Partida
  @OneToMany(() => Partida, (partida) => partida.tipoPartida)
  partidas!: Partida[];
}
