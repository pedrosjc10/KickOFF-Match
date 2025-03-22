import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  BaseEntity, 
  ManyToOne,
  JoinColumn
} from "typeorm";
import { Local } from "./Local"; 
import { Usuario } from "./Usuario"; 
import { TipoPartida } from "./TipoPartida"; 

@Entity("partida")
export class Partida extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "tinyint" })
  tipo!: number;

  @Column({ type: "date" })
  data!: Date;

  @Column({ type: "time" })
  hora!: string;

  @Column({ type: "varchar", length: 100 })
  time!: string;

  @Column({ type: "varchar", length: 45 })
  placar!: string;

  @ManyToOne(() => Local, (local) => local.partidas, {
    onDelete: "CASCADE", 
  })
  @JoinColumn({ name: "local_id" })
  local!: Local;

  @ManyToOne(() => Usuario, (usuario) => usuario.partidas, {
    onDelete: "CASCADE", 
  })
  @JoinColumn({ name: "usuario_id" })
  usuario!: Usuario;

  @ManyToOne(() => TipoPartida, (tipoPartida) => tipoPartida.partidas, {
    onDelete: "CASCADE", 
  })
  @JoinColumn({ name: "tipoPartida_idtipoPartida" })
  tipoPartida!: TipoPartida;
}
