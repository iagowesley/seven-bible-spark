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
import { Pencil, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Trimestre, criarTrimestre, listarTrimestres, atualizarTrimestre, excluirTrimestre } from '@/models/trimestreService';

const TrimestreList: React.FC = () => {
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTrimestre, setSelectedTrimestre] = useState<Trimestre | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    ano: new Date().getFullYear(),
    trimestre: ''
  });
  const [imagem, setImagem] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  const carregarTrimestres = async () => {
    try {
      setLoading(true);
      const data = await listarTrimestres();
      setTrimestres(data);
    } catch (error) {
      console.error('Erro ao carregar trimestres:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os trimestres.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    carregarTrimestres();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'ano' ? parseInt(value) || '' : value,
    });
  };
  
  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImagem(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const resetForm = () => {
    setFormData({ nome: '', ano: new Date().getFullYear(), trimestre: '' });
    setSelectedTrimestre(null);
    setImagem(null);
    setPreviewUrl(null);
  };
  
  const handleOpenDialog = (trimestre?: Trimestre) => {
    if (trimestre) {
      setSelectedTrimestre(trimestre);
      setFormData({
        nome: trimestre.nome,
        ano: trimestre.ano,
        trimestre: trimestre.trimestre || ''
      });
      setPreviewUrl(trimestre.img_url || null);
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };
  
  const handleOpenDeleteDialog = (trimestre: Trimestre) => {
    setSelectedTrimestre(trimestre);
    setDeleteDialogOpen(true);
  };
  
  const handleSalvar = async () => {
    try {
      if (!formData.nome) {
        toast({
          title: 'Campo obrigatório',
          description: 'O nome do trimestre é obrigatório.',
          variant: 'destructive',
        });
        return;
      }
      
      if (!formData.trimestre) {
        toast({
          title: 'Campo obrigatório',
          description: 'O número do trimestre é obrigatório.',
          variant: 'destructive',
        });
        return;
      }
      
      if (selectedTrimestre) {
        // Atualizar trimestre existente
        await atualizarTrimestre(selectedTrimestre.id, formData, imagem || undefined);
        toast({
          title: 'Trimestre atualizado',
          description: 'O trimestre foi atualizado com sucesso.',
        });
      } else {
        // Criar novo trimestre
        await criarTrimestre(formData, imagem || undefined);
        toast({
          title: 'Trimestre criado',
          description: 'O trimestre foi criado com sucesso.',
        });
      }
      
      handleCloseDialog();
      carregarTrimestres();
    } catch (error) {
      console.error('Erro ao salvar trimestre:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o trimestre.',
        variant: 'destructive',
      });
    }
  };
  
  const handleExcluir = async () => {
    if (!selectedTrimestre) return;
    
    try {
      await excluirTrimestre(selectedTrimestre.id);
      setDeleteDialogOpen(false);
      carregarTrimestres();
      toast({
        title: 'Trimestre excluído',
        description: 'O trimestre foi excluído com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao excluir trimestre:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o trimestre.',
        variant: 'destructive',
      });
    }
  };
  
  const handleVerSemanas = (trimestre: Trimestre) => {
    navigate(`/admin/trimestres/${trimestre.id}/semanas`);
  };
  
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Trimestres</CardTitle>
          <Button variant="outline" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Trimestre
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : trimestres.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum trimestre cadastrado. Clique em "Novo Trimestre" para começar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Trimestre</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trimestres.map((trimestre) => (
                  <TableRow key={trimestre.id}>
                    <TableCell>
                      {trimestre.img_url ? (
                        <div className="h-12 w-12 relative rounded-md overflow-hidden">
                          <img 
                            src={trimestre.img_url} 
                            alt={`Imagem do trimestre ${trimestre.nome}`}
                            className="object-cover h-full w-full"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 bg-muted flex items-center justify-center rounded-md">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{trimestre.trimestre}</TableCell>
                    <TableCell>{trimestre.nome}</TableCell>
                    <TableCell>{trimestre.ano}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerSemanas(trimestre)}
                        >
                          Ver Semanas
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(trimestre)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDeleteDialog(trimestre)}
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
      
      {/* Dialog para criar/editar trimestre */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTrimestre ? 'Editar Trimestre' : 'Novo Trimestre'}
            </DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para {selectedTrimestre ? 'editar o' : 'criar um novo'} trimestre.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome do Trimestre</Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Ex: Primeiro Trimestre"
                value={formData.nome}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ano">Ano</Label>
              <Input
                id="ano"
                name="ano"
                type="number"
                placeholder="Ex: 2024"
                value={formData.ano}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="trimestre">Trimestre</Label>
              <Input
                id="trimestre"
                name="trimestre"
                placeholder="Ex: 01, 02, 03..."
                value={formData.trimestre}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imagem">Imagem do Trimestre</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('imagem')?.click()}
                  className="cursor-pointer"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {imagem ? 'Trocar Imagem' : 'Escolher Imagem'}
                </Button>
                <Input
                  id="imagem"
                  name="imagem"
                  type="file"
                  accept="image/*"
                  onChange={handleImagemChange}
                  className="hidden"
                />
                <span className="text-sm text-muted-foreground">
                  {imagem ? imagem.name : 'Nenhum arquivo selecionado'}
                </span>
              </div>
              
              {/* Preview da imagem */}
              {previewUrl && (
                <div className="mt-4">
                  <p className="text-sm mb-2">Preview:</p>
                  <div className="relative h-40 w-full sm:w-64 rounded-md overflow-hidden border">
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
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o trimestre
              {selectedTrimestre ? ` "${selectedTrimestre.nome}"` : ''} e todos os dados associados.
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

export default TrimestreList; 