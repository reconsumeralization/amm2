'use client';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $createTextNode, $insertNodes } from 'lexical';
import { useState, useEffect } from 'react';

export default function ProductEmbedPlugin({ tenantId = 'tenant-id-placeholder' }: { tenantId?: string }) {
  const [editor] = useLexicalComposerContext();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/features/products?tenantId=${tenantId}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.docs || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [tenantId]);

  const embedProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    editor.update(() => {
      const paragraph = $createParagraphNode();
      const productText = `${product.name} - $${(product.price / 100).toFixed(2)}\n${product.description || 'Premium styling product.'}`;
      paragraph.append($createTextNode(productText));
      $insertNodes([paragraph]);
    });
  };

  return (
    <div className="p-2">
      <select 
        onChange={(e) => embedProduct(e.target.value)} 
        className="p-2 border border-gray-300 rounded-md text-sm"
        disabled={loading}
      >
        <option value="">
          {loading ? 'Loading products...' : 'Embed Product'}
        </option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} - ${(product.price / 100).toFixed(2)}
          </option>
        ))}
      </select>
    </div>
  );
}
