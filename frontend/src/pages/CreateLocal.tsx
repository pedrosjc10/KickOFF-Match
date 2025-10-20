import React, { useState } from 'react';
import styles from '../styles/CreateLocal.module.css';

 const CreateLocal: React.FC = () => {
  const [form, setForm] = useState({
   nome: '',
    cidade: '',
    tipo: '',
    modalidade: '',
    cep: '',
    logradouro: '',
    numero: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Usando o service
      await import('../services/localService').then(({ createLocal }) => createLocal(form));
      setMessage('Local cadastrado com sucesso!');
      setForm({ nome: '', cidade: '', tipo: '', modalidade: '', cep: '', logradouro: '', numero: '' });
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Erro ao cadastrar local');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Cadastrar Local</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input className={styles.input} name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required />
        <input className={styles.input} name="cidade" placeholder="Cidade" value={form.cidade} onChange={handleChange} required />
        <input className={styles.input} name="tipo" placeholder="Tipo" value={form.tipo} onChange={handleChange} required />
        <input className={styles.input} name="modalidade" placeholder="Modalidade" value={form.modalidade} onChange={handleChange} required />
        <input className={styles.input} name="cep" placeholder="CEP" value={form.cep} onChange={handleChange} required />
        <input className={styles.input} name="logradouro" placeholder="Logradouro" value={form.logradouro} onChange={handleChange} required />
        <input className={styles.input} name="numero" placeholder="Número" value={form.numero} onChange={handleChange} required />
        <button  type="submit">Cadastrar</button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default CreateLocal;
