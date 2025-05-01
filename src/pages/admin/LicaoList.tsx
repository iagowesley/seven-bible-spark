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
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Pencil, 
  Trash2, 
  Plus, 
  ArrowLeft, 
  FileText, 
  Check, 
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { obterSemana } from '@/models/semanaService';
import { 
  Licao, 
  criarLicao, 
  listarLicoesPorSemana, 
  atualizarLicao, 
  excluirLicao, 
  verificarSemanaCompleta 
} from '@/models/licaoService';

interface FormData {
  dia: string;
  texto1: string;
  texto2: string;
  resumo: string;
  hashtags: string;
  texto_biblico_chave: string;
  titulo_dia: string;
  subtitulo_dia: string;
  perguntas: string;
}

const LicaoList: React.FC = () => {
  const { semanaId = '' } = useParams<{ semanaId: string }>();
  const [licoes, setLicoes] = useState<Licao[]>([]);
  const [semanaTitulo, setSemanaTitulo] = useState('');
  const [trimestreId, setTrimestreId] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedLicao, setSelectedLicao] = useState<Licao | null>(null);
  const [semanaCompleta, setSemanaCompleta] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    dia: '',
    texto1: '',
    texto2: '',
    resumo: '',
    hashtags: '',
    texto_biblico_chave: '',
    titulo_dia: '',
    subtitulo_dia: '',
    perguntas: '',
  });
  
  const diasSemana = [
    { valor: 'domingo', label: 'Domingo' },
    { valor: 'segunda', label: 'Segunda-feira' },
    { valor: 'terca', label: 'Terça-feira' },
    { valor: 'quarta', label: 'Quarta-feira' },
    { valor: 'quinta', label: 'Quinta-feira' },
    { valor: 'sexta', label: 'Sexta-feira' },
    { valor: 'sabado', label: 'Sábado' },
  ];
  
  const diasDisponiveis = diasSemana.filter(
    dia => !licoes.some(licao => licao.dia === dia.valor)
  );
  
  const navigate = useNavigate();
  
  const carregarDados = async () => {
    try {
      setLoading(true);
      const [semana, licoesData] = await Promise.all([
        obterSemana(semanaId),
        listarLicoesPorSemana(semanaId)
      ]);
      
      if (semana) {
        setSemanaTitulo(semana.titulo);
        setTrimestreId(semana.trimestre_id);
      }
      
      setLicoes(licoesData);
      
      // Verificar se a semana está completa
      const completa = await verificarSemanaCompleta(semanaId);
      setSemanaCompleta(completa);
      
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
    if (semanaId) {
      carregarDados();
    }
  }, [semanaId]);
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      dia: value,
    });
  };
  
  const resetForm = () => {
    setFormData({
      dia: diasDisponiveis.length > 0 ? diasDisponiveis[0].valor : '',
      texto1: '',
      texto2: '',
      resumo: '',
      hashtags: '',
      texto_biblico_chave: '',
      titulo_dia: '',
      subtitulo_dia: '',
      perguntas: '',
    });
    setSelectedLicao(null);
  };
  
  const handleOpenDialog = (licao?: Licao) => {
    if (licao) {
      setSelectedLicao(licao);
      setFormData({
        dia: licao.dia,
        texto1: licao.texto1,
        texto2: licao.texto2,
        resumo: licao.resumo,
        hashtags: licao.hashtags,
        texto_biblico_chave: licao.texto_biblico_chave || '',
        titulo_dia: licao.titulo_dia || '',
        subtitulo_dia: licao.subtitulo_dia || '',
        perguntas: licao.perguntas || '',
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };
  
  const handleOpenDeleteDialog = (licao: Licao) => {
    setSelectedLicao(licao);
    setDeleteDialogOpen(true);
  };
  
  const handleSalvar = async () => {
    try {
      // Validar campos obrigatórios
      if (!formData.dia || !formData.texto1 || !formData.titulo_dia) {
        toast({
          title: 'Campos obrigatórios',
          description: 'O dia da semana, o título do dia e o texto principal são obrigatórios.',
          variant: 'destructive',
        });
        return;
      }
      
      // Preparar dados para salvar
      const dadosParaSalvar = {
        ...formData,
        // Definir texto_biblico_chave como null para dias que não são sábado
        texto_biblico_chave: formData.dia === 'sabado' ? formData.texto_biblico_chave : null,
        // Definir subtitulo_dia como null para sábado
        subtitulo_dia: formData.dia !== 'sabado' ? formData.subtitulo_dia : null,
        // Definir perguntas como null para sábado
        perguntas: formData.dia !== 'sabado' ? formData.perguntas : null
      };
      
      if (selectedLicao) {
        // Atualizar lição existente
        await atualizarLicao(selectedLicao.id, dadosParaSalvar);
        toast({
          title: 'Lição atualizada',
          description: 'A lição foi atualizada com sucesso.',
        });
      } else {
        // Criar nova lição
        await criarLicao({
          semana_id: semanaId,
          ...dadosParaSalvar,
        });
        toast({
          title: 'Lição criada',
          description: 'A lição foi criada com sucesso.',
        });
      }
      
      handleCloseDialog();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar lição:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível salvar a lição.';
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };
  
  const handleExcluir = async () => {
    if (!selectedLicao) return;
    
    try {
      await excluirLicao(selectedLicao.id);
      setDeleteDialogOpen(false);
      carregarDados();
      toast({
        title: 'Lição excluída',
        description: 'A lição foi excluída com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao excluir lição:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a lição.',
        variant: 'destructive',
      });
    }
  };
  
  const voltarParaSemanas = () => {
    navigate(`/admin/trimestres/${trimestreId}/semanas`);
  };
  
  const getDiaLabel = (valor: string): string => {
    const dia = diasSemana.find(d => d.valor === valor);
    return dia ? dia.label : valor;
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={voltarParaSemanas} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Semanas
        </Button>
        <h1 className="text-2xl font-bold">
          Lições da Semana: {semanaTitulo}
        </h1>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${semanaCompleta ? 'bg-green-500' : 'bg-amber-500'}`}></div>
          <span className="text-sm font-medium">
            {semanaCompleta ? 
              'Semana completa - todas as lições de domingo até sexta cadastradas' : 
              'Semana incompleta - faltam lições de domingo até sexta'}
          </span>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => handleOpenDialog()}
          disabled={diasDisponiveis.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Lição {diasDisponiveis.length === 0 && '(Todos os dias já cadastrados)'}
        </Button>
      </div>
      
      {!semanaCompleta && (
        <div className="mb-6 p-3 border rounded-md bg-amber-50">
          <p className="font-medium text-amber-800 mb-2">Dias pendentes:</p>
          <div className="flex flex-wrap gap-2">
            {diasDisponiveis
              .filter(dia => dia.valor !== "sabado")
              .map(dia => (
                <span 
                  key={dia.valor} 
                  className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                >
                  {dia.label}
                </span>
              ))
            }
          </div>
        </div>
      )}
      
      <div className="mb-6 p-4 border rounded-md bg-blue-50 text-blue-800">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-medium">Importante</p>
            <p className="text-sm">
              Uma semana só aparecerá no aplicativo quando todas as lições de domingo até sexta estiverem cadastradas.
              O cadastro do sábado é opcional e não afeta a visibilidade da semana no aplicativo.
            </p>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lições</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : licoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma lição cadastrada. Clique em "Nova Lição" para começar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dia</TableHead>
                  <TableHead>Resumo</TableHead>
                  <TableHead>Hashtags</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licoes.map((licao) => (
                  <TableRow key={licao.id}>
                    <TableCell className="font-medium">{getDiaLabel(licao.dia)}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{licao.resumo}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{licao.hashtags}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(licao)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Editar Conteúdo
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDeleteDialog(licao)}
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
      
      {/* Dialog para criar/editar lição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedLicao ? 'Editar Lição' : 'Nova Lição'}
            </DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para {selectedLicao ? 'editar a' : 'criar uma nova'} lição.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            <div className="grid gap-2">
              <Label htmlFor="dia">Dia da Semana</Label>
              <Select value={formData.dia} onValueChange={handleSelectChange} disabled={!!selectedLicao}>
                <SelectTrigger id="dia">
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {(selectedLicao 
                    ? diasSemana.filter(d => d.valor === selectedLicao.dia) 
                    : diasDisponiveis).map((dia) => (
                    <SelectItem key={dia.valor} value={dia.valor}>
                      {dia.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedLicao 
                  ? 'O dia da semana não pode ser alterado depois de criado.' 
                  : 'Selecione o dia da semana para esta lição.'}
              </p>
            </div>
            
            {formData.dia === 'sabado' && (
              <div className="grid gap-2">
                <Label htmlFor="texto_biblico_chave" className="flex items-center">
                  Texto bíblico chave
                  <span className="ml-2 bg-[#a37fb9]/20 text-[#a37fb9] text-xs px-2 py-0.5">
                    Importante para o Sábado
                  </span>
                </Label>
                <Textarea
                  id="texto_biblico_chave"
                  name="texto_biblico_chave"
                  placeholder="Digite o texto bíblico chave da semana (ex: João 3:16)"
                  value={formData.texto_biblico_chave}
                  onChange={handleInputChange}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  O texto bíblico chave será destacado na página da lição do sábado.
                </p>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="texto1">Texto Principal</Label>
              <Textarea
                id="texto1"
                name="texto1"
                placeholder="Digite o texto principal da lição..."
                value={formData.texto1}
                onChange={handleInputChange}
                rows={6}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="texto2">Texto Secundário (opcional)</Label>
              <Textarea
                id="texto2"
                name="texto2"
                placeholder="Digite um texto secundário para a lição (opcional)..."
                value={formData.texto2}
                onChange={handleInputChange}
                rows={6}
              />
            </div>
            
            {/* Campo de perguntas (apenas para dias que não são sábado) */}
            {formData.dia !== 'sabado' && (
              <div className="grid gap-2">
                <Label htmlFor="perguntas">Perguntas (opcional)</Label>
                <Textarea
                  id="perguntas"
                  name="perguntas"
                  placeholder="Digite perguntas para reflexão (opcional)..."
                  value={formData.perguntas}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="resumo">Resumo</Label>
              <Textarea
                id="resumo"
                name="resumo"
                placeholder="Digite um resumo breve da lição..."
                value={formData.resumo}
                onChange={handleInputChange}
                rows={2}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="hashtags">Hashtags</Label>
              <Input
                id="hashtags"
                name="hashtags"
                placeholder="Ex: fé esperança amor (separadas por espaço)"
                value={formData.hashtags}
                onChange={handleInputChange}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Digite as hashtags separadas por espaço, sem o símbolo #.
              </p>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="titulo_dia" className="mb-2 block">
                Título do Dia <span className="text-red-500">*</span>
              </Label>
              <Input
                id="titulo_dia"
                name="titulo_dia"
                value={formData.titulo_dia}
                onChange={handleInputChange}
                className="w-full"
                placeholder="Título para este dia"
                required
              />
            </div>
            
            {formData.dia !== 'sabado' && (
              <div className="mb-4">
                <Label htmlFor="subtitulo_dia" className="mb-2 block">
                  Subtítulo do Dia
                </Label>
                <Input
                  id="subtitulo_dia"
                  name="subtitulo_dia"
                  value={formData.subtitulo_dia}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Subtítulo para este dia"
                />
              </div>
            )}
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
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a lição de
              {selectedLicao ? ` ${getDiaLabel(selectedLicao.dia)}` : ''}.
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

export default LicaoList; 