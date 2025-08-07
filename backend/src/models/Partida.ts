import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { TipoPartida } from "./TipoPartida";
import { Local } from "./Local"; // Importe a entidade Local
import { PartidaUsuario } from "./PartidaUsuario"; // Importe a entidade de relacionamento

@Entity("partida") // Nome da tabela no banco
export class Partida {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "smallint" }) // Tipo corrigido para ser compatível com PostgreSQL
  tipo!: number;

  @Column()
  data!: Date;

  @Column()
  hora!: string;

  @Column()
  nome!: string;

  // Relacionamento com a entidade TipoPartida
  @ManyToOne(() => TipoPartida)
  @JoinColumn({ name: 'tipopartida_idtipopartida' }) // <-- Correção: Especifique o nome da coluna de chave estrangeira
  tipoPartida!: TipoPartida;

  // Relacionamento com a entidade Local
  @ManyToOne(() => Local)
  @JoinColumn({ name: 'local_id' }) // <-- Correção: Especifique a chave estrangeira para Local
  local!: Local;

  // Relacionamento com a tabela de junção PartidaUsuario
  @OneToMany(() => PartidaUsuario, partidaUsuario => partidaUsuario.partida)
  partidaUsuarios!: PartidaUsuario[];
}