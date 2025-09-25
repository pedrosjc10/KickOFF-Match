import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Partida } from "./Partida";
import { Usuario } from "./Usuario";

@Entity("partida_usuario") // <-- Correção: Especifique o nome da tabela se for diferente do nome da classe
export class PartidaUsuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  confirmado!: boolean;

  @Column()
  organizador!: boolean;

  @Column()
  habilidade!: number;
  
  @Column({ name: 'jog_linha' }) // <-- Correção: Especifique o nome da coluna caso seja diferente
  jog_linha!: boolean;

  @ManyToOne(() => Partida, (partida) => partida.partidaUsuarios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partida_id' }) // <-- Correção: Especifique a chave estrangeira
  partida!: Partida;

  @ManyToOne(() => Usuario, (usuario) => usuario.partidaUsuarios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' }) // <-- Correção: Especifique a chave estrangeira
  usuario!: Usuario;
}
