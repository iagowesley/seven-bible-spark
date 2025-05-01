import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, Plus, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Semana, criarSemana, listarSemanasPorTrimestre, atualizarSemana, excluirSemana } from '@/models/semanaService';
import { obterTrimestre } from '@/models/trimestreService';

const SemanaList: React.FC = () => {
  const { trimestreId = '' } = useParams<{ trimestreId: string }>();
  const [semanas, setSemanas] = useState<Semana[]>([]);
  const [trimestreNome, setTrimestreNome] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSemana, setSelectedSemana] = useState<Semana | null>(null);
  const [formData, setFormData] = useState({
    numero: 1,
    titulo: '',
    texto_biblico_chave: '',
    resumo: '',
  });
  const [imagemSabado, setImagemSabado] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  const carregarDados = async () => {
    try {
      setLoading(true);
      const [trimestre, semanasData] = await Promise.all([
        obterTrimestre(trimestreId),
        listarSemanasPorTrimestre(trimestreId)
      ]);
      
      if (trimestre) {
        setTrimestreNome(trimestre.nome);
      }
      
      setSemanas(semanasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (trimestreId) {
      carregarDados();
    }
  }, [trimestreId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'numero' ? parseInt(value) || '' : value,
    });
  };
  
  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImagemSabado(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const resetForm = () => {
    const maxNumero = semanas.length > 0 
      ? Math.max(...semanas.map(s => s.numero)) + 1 
      : 1;
      
    setFormData({ 
      numero: maxNumero, 
      titulo: '', 
      texto_biblico_chave: '',
      resumo: ''
    });
    setSelectedSemana(null);
    setImagemSabado(null);
    setPreviewUrl(null);
  };
  
  const handleOpenDialog = (semana?: Semana) => {
    if (semana) {
      setSelectedSemana(semana);
      setFormData({
        numero: semana.numero,
        titulo: semana.titulo,
        texto_biblico_chave: semana.texto_biblico_chave,
        resumo: semana.resumo,
      });
      setPreviewUrl(semana.img_sabado_url);
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };
  
  const handleOpenDeleteDialog = (semana: Semana) => {
    setSelectedSemana(semana);
    setDeleteDialogOpen(true);
  };
  
  const handleSalvar = async () => {
    try {
      if (!formData.titulo) {
        toast({
          title: 'Campo obrigatório',
          description: 'O título da semana é obrigatório.',
          variant: 'destructive',
        });
        return;
      }
      
      if (selectedSemana) {
        // Atualizar semana existente
        await atualizarSemana(selectedSemana.id, {
          numero: formData.numero,
          titulo: formData.titulo,
          texto_biblico_chave: formData.texto_biblico_chave,
          resumo: formData.resumo,
        }, imagemSabado || undefined);
        
        toast({
          title: 'Semana atualizada',
          description: 'A semana foi atualizada com sucesso.',
        });
      } else {
        // Criar nova semana
        await criarSemana({
          trimestre_id: trimestreId,
          numero: formData.numero,
          titulo: formData.titulo,
          texto_biblico_chave: formData.texto_biblico_chave,
          resumo: formData.resumo,
        }, imagemSabado || undefined);
        
        toast({
          title: 'Semana criada',
          description: 'A semana foi criada com sucesso.',
        });
      }
      
      handleCloseDialog();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar semana:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a semana.',
        variant: 'destructive',
      });
    }
  };
  
  const handleExcluir = async () => {
    if (!selectedSemana) return;
    
    try {
      await excluirSemana(selectedSemana.id);
      setDeleteDialogOpen(false);
      carregarDados();
      toast({
        title: 'Semana excluída',
        description: 'A semana foi excluída com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao excluir semana:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a semana.',
        variant: 'destructive',
      });
    }
  };
  
  const handleVerLicoes = (semana: Semana) => {
    navigate(`/admin/semanas/${semana.id}/licoes`);
  };
  
  const voltarParaTrimestres = () => {
    navigate('/admin/trimestres');
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={voltarParaTrimestres} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Trimestres
        </Button>
        <h1 className="text-2xl font-bold">
          Semanas do Trimestre: {trimestreNome}
        </h1>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Semanas</CardTitle>
          <Button variant="outline" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Semana
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : semanas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma semana cadastrada. Clique em "Nova Semana" para começar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Texto bíblico chave</TableHead>
                  <TableHead>Resumo</TableHead>
                  <TableHead>Imagem</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {semanas.map((semana) => (
                  <TableRow key={semana.id}>
                    <TableCell>{semana.numero}</TableCell>
                    <TableCell className="font-medium">{semana.titulo}</TableCell>
                    <TableCell>{semana.texto_biblico_chave}</TableCell>
                    <TableCell>{semana.resumo}</TableCell>
                    <TableCell>
                      {semana.img_sabado_url ? (
                        <div className="relative h-10 w-10 rounded-md overflow-hidden">
                          <img 
                            src={semana.img_sabado_url} 
                            alt={`Imagem da semana ${semana.numero}`}
                            className="object-cover h-full w-full"
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Sem imagem</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerLicoes(semana)}
                        >
                          Ver Lições
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(semana)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDeleteDialog(semana)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog para criar/editar semana */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {selectedSemana ? 'Editar Semana' : 'Nova Semana'}
            </DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para {selectedSemana ? 'editar a' : 'criar uma nova'} semana.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="numero">Número da Semana</Label>
              <Input
                id="numero"
                name="numero"
                type="number"
                min="1"
                max="13"
                value={formData.numero}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                name="titulo"
                placeholder="Ex: Deus é Amor"
                value={formData.titulo}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="texto_biblico_chave">Texto bíblico chave</Label>
              <Input
                id="texto_biblico_chave"
                name="texto_biblico_chave"
                placeholder="Ex: Gênesis 1:1"
                value={formData.texto_biblico_chave}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="resumo">Resumo</Label>
              <Input
                id="resumo"
                name="resumo"
                placeholder="Ex: Uma visão geral sobre o assunto"
                value={formData.resumo}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="img_sabado">Imagem do Sábado</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('img_sabado')?.click()}
                  className="cursor-pointer"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {imagemSabado ? 'Trocar Imagem' : 'Escolher Imagem'}
                </Button>
                <Input
                  id="img_sabado"
                  name="img_sabado"
                  type="file"
                  accept="image/*"
                  onChange={handleImagemChange}
                  className="hidden"
                />
                <span className="text-sm text-muted-foreground">
                  {imagemSabado ? imagemSabado.name : 'Nenhum arquivo selecionado'}
                </span>
              </div>
              
              {/* Preview da imagem */}
              {previewUrl && (
                <div className="mt-4">
                  <p className="text-sm mb-2">Preview:</p>
                  <div className="relative h-32 w-32 rounded-md overflow-hidden border">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="object-cover h-full w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de confirmação para excluir */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a semana
              {selectedSemana ? ` "${selectedSemana.titulo}"` : ''} e todas as lições associadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SemanaList; 