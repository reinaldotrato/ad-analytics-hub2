import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useCrmData';
import { toast } from 'sonner';

export function ProductsTab() {
  const { data: products = [], isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setCode('');
    setName('');
    setDescription('');
    setUnitPrice('');
    setCategory('');
    setIsActive(true);
  };

  const handleCreate = async () => {
    if (!code.trim() || !name.trim()) {
      toast.error('Código e nome são obrigatórios');
      return;
    }
    try {
      await createProduct.mutateAsync({
        code,
        name,
        description,
        unit_price: parseFloat(unitPrice) || 0,
        category,
        is_active: isActive,
      });
      toast.success('Produto criado com sucesso');
      setIsCreateOpen(false);
      resetForm();
    } catch (error: any) {
      if (error.message?.includes('duplicate')) {
        toast.error('Já existe um produto com este código');
      } else {
        toast.error('Erro ao criar produto');
      }
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct || !code.trim() || !name.trim()) return;
    try {
      await updateProduct.mutateAsync({
        id: editingProduct.id,
        updates: {
          code,
          name,
          description,
          unit_price: parseFloat(unitPrice) || 0,
          category,
          is_active: isActive,
        },
      });
      toast.success('Produto atualizado');
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      toast.error('Erro ao atualizar produto');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Produto excluído');
    } catch (error) {
      toast.error('Erro ao excluir produto');
    }
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setCode(product.code);
    setName(product.name);
    setDescription(product.description || '');
    setUnitPrice(product.unit_price?.toString() || '');
    setCategory(product.category || '');
    setIsActive(product.is_active ?? true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Carregando produtos...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Produtos</CardTitle>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Produto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Código *</Label>
                  <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="PROD001" />
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Curso, Serviço..." />
                </div>
              </div>
              <div>
                <Label htmlFor="product-name">Nome *</Label>
                <Input id="product-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do produto" />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição do produto..." />
              </div>
              <div>
                <Label htmlFor="unit-price">Valor Unitário (R$)</Label>
                <Input id="unit-price" type="number" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="0,00" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is-active">Produto ativo</Label>
                <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={createProduct.isPending}>Criar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum produto cadastrado</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor Unit.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-sm">{product.code}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.category || '-'}</TableCell>
                  <TableCell>{formatCurrency(product.unit_price)}</TableCell>
                  <TableCell>
                    {product.is_active ? (
                      <Badge className="bg-green-500">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingProduct} onOpenChange={(open) => { if (!open) { setEditingProduct(null); resetForm(); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-code">Código *</Label>
                  <Input id="edit-code" value={code} onChange={(e) => setCode(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Input id="edit-category" value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-product-name">Nome *</Label>
                <Input id="edit-product-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-unit-price">Valor Unitário (R$)</Label>
                <Input id="edit-unit-price" type="number" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-is-active">Produto ativo</Label>
                <Switch id="edit-is-active" checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancelar</Button>
                <Button onClick={handleUpdate} disabled={updateProduct.isPending}>Salvar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
