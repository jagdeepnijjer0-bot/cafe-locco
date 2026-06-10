import { Home, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface GalleryPageProps {
  onBack: () => void;
}

export function GalleryPage({ onBack }: GalleryPageProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // High-quality cafe images
  const galleryImages = [
    'https://images.unsplash.com/photo-1636928837218-f2b56d5a7861?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYWZlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY3NDYzODA0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1634709170162-23a76022e9c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwY29mZmVlJTIwYXJ0fGVufDF8fHx8MTc2NzU1MjIzNnww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1724015736761-da5ad4cff19d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cHNjYWxlJTIwcmVzdGF1cmFudCUyMGZvb2R8ZW58MXx8fHwxNzY3NTUyMjM3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1729223921117-08915ddbfcc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwYnJlYWtmYXN0JTIwcGxhdGV8ZW58MXx8fHwxNzY3NTUyMjM3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1672811155668-75766f8fc277?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwY2FmZSUyMGRlc3NlcnR8ZW58MXx8fHwxNzY3NTUyMjM3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1547240089-566513e12c89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwY29mZmVlJTIwYmFyaXN0YXxlbnwxfHx8fDE3Njc1NTIyMzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1760431194370-48fe900d09f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjYWZlJTIwYW1iaWFuY2V8ZW58MXx8fHwxNzY3NTUyMjM4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1648062165414-25e2e1aeb422?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGVjaWFsdHklMjBjb2ZmZWUlMjBkcmlua3xlbnwxfHx8fDE3Njc1NTIyMzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1638274275149-e45b0c914bfe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwYnJ1bmNofGVufDF8fHx8MTc2NzU1MjIzOXww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1582076151909-b80addc76f97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZlJTIwbGF0dGUlMjBhcnR8ZW58MXx8fHwxNzY3NTUyMjM5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1684568519320-8c6b14f7e65f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwcGxhdGluZyUyMGZvb2R8ZW58MXx8fHwxNzY3NTUyMjQwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1571130961933-0680ba8d5ff2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYWZlJTIwc2VhdGluZ3xlbnwxfHx8fDE3Njc1NTIyNDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1764486601113-a6856cdce5fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwcGFzdHJ5JTIwZGlzcGxheXxlbnwxfHx8fDE3Njc1NTIyNDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1645445644664-8f44112f334c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3ByZXNzbyUyMGNvZmZlZSUyMGN1cHxlbnwxfHx8fDE3Njc1MjU1OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1756397481872-ed981ef72a51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwcmVzdGF1cmFudCUyMGludGVyaW9yfGVufDF8fHx8MTc2NzUwODYwM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1627378378955-a3f4e406c5de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwYnVyZ2VyJTIwZm9vZHxlbnwxfHx8fDE3Njc0NjIxMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1549746434-6331eadece3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZlJTIwY2FwcHVjY2lubyUyMGZvYW18ZW58MXx8fHwxNzY3NTUyMjQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1658280024253-34cafdfbb002?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBicmVha2Zhc3QlMjB0YWJsZXxlbnwxfHx8fDE3Njc1NTIyNDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1633654304416-8fe28668210a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwY2FmZSUyMGNvdW50ZXJ8ZW58MXx8fHwxNzY3NTUyMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1635194878565-5ee8993dbffb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwYXZvY2FkbyUyMHRvYXN0fGVufDF8fHx8MTc2NzU1MjI0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1761490953261-e8f287372351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZlJTIwcGFuY2FrZXMlMjBzdGFja3xlbnwxfHx8fDE3Njc1NTIyNDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1557079604-d28080618be0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXN0YXVyYW50JTIwZGlzaHxlbnwxfHx8fDE3Njc1NTIyNDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1767515341199-451947d081ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwYXRtb3NwaGVyZXxlbnwxfHx8fDE3Njc1NTIyNDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1763647814142-b1eb054d42f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwc2FuZHdpY2glMjBmb29kfGVufDF8fHx8MTc2NzU1MjI0N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1599937577325-e38f27f010db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZlJTIwbWlsa3NoYWtlJTIwZHJpbmt8ZW58MXx8fHwxNzY3NTUyMjQ3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1698280954292-c955f882486f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwY2FmZSUyMHRhYmxlfGVufDF8fHx8MTc2NzU1MjI0OHww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1767065886275-2a8ff2eaa13a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwYnJlYWQlMjBwYXN0cnl8ZW58MXx8fHwxNzY3NTUyMjQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1762631383846-6bead15b9796?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwc2FsYWQlMjBib3dsfGVufDF8fHx8MTc2NzU1MjI0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1548351043-129fbb1780fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGVjaWFsdHklMjB0ZWElMjBkcmlua3xlbnwxfHx8fDE3Njc1NTIyNDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1706953226725-1ed9f815b497?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZlJTIwY3JvaXNzYW50JTIwY29mZmVlfGVufDF8fHx8MTc2NzU1MjI1MHww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1739248047812-cf898eb58786?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwYmFyJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY3NDc0OTg2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1762631934366-efa1a9f56da3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwZWdncyUyMGJlbmVkaWN0fGVufDF8fHx8MTc2NzU1MjI1MHww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1571130961933-0680ba8d5ff2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYWZlJTIwbGlnaHRpbmd8ZW58MXx8fHwxNzY3NTUyMjUxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1572882791287-36edd7557277?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwc21vb3RoaWUlMjBib3dsfGVufDF8fHx8MTc2NzU1MjI1MXww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1655475782112-a6302e5b415f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwY29mZmVlJTIwcm9hc3Rpbmd8ZW58MXx8fHwxNzY3NTE3NDQ3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1759050485212-75538bf33ccb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjByZXN0YXVyYW50JTIwc2VhdGluZ3xlbnwxfHx8fDE3Njc1NTIyNTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1593250186288-f06f69859f8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZlJTIwd2FmZmxlJTIwZGVzc2VydHxlbnwxfHx8fDE3Njc1NTIyNTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1767065604207-8876c6bfb5be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwcGl6emElMjBzbGljZXxlbnwxfHx8fDE3Njc1NTIyNTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1741850419927-caee43cd1031?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB0ZWElMjBzZXJ2aWNlfGVufDF8fHx8MTc2NzU1MjI1M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1643008740170-229347d7de20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZlJTIwZnJlbmNoJTIwdG9hc3R8ZW58MXx8fHwxNzY3NTUyMjUzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1762958118340-6d09cfe236a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwcmVzdGF1cmFudCUyMGFtYmlhbmNlfGVufDF8fHx8MTc2NzQzNzYyMnww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1661668998418-ff67c6b0194e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGVjaWFsdHklMjBjb2ZmZWUlMjBiZWFuc3xlbnwxfHx8fDE3Njc0NTI3NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1654921913191-f535f8978768?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZlJTIwY2hvY29sYXRlJTIwZGVzc2VydHxlbnwxfHx8fDE3Njc1NTIyNTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1648754016717-449b9bb98ba7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiaXN0cm8lMjBmb29kfGVufDF8fHx8MTc2NzU1MjI1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1607109793107-4124730a011f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwY29mZmVlJTIwcG91cnxlbnwxfHx8fDE3Njc1NTIyNTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1690740548374-df4075dd79b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBicnVuY2glMjBzZXR0aW5nfGVufDF8fHx8MTc2NzU1MjI1NXww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1707528903686-91cbbe2f2985?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZlJTIwY2hlZXNlY2FrZSUyMHNsaWNlfGVufDF8fHx8MTc2NzU1MjI1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1676300184847-4ee4030409c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwcGFzdGElMjBkaXNofGVufDF8fHx8MTc2NzQ0NzM3OXww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1759264244719-94b45845fb92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwY2FmZSUyMGRlY29yfGVufDF8fHx8MTc2NzU1MjI1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1634863619588-85ff90ef2904?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGVjaWFsdHklMjBpY2VkJTIwY29mZmVlfGVufDF8fHx8MTc2NzU1MjI1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1722942469974-bb19e2d7d696?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwYnJlYWtmYXN0JTIwc3ByZWFkfGVufDF8fHx8MTc2NzU1MjI1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1767065584306-267605a61c95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZlJTIwZnJ1aXQlMjB0YXJ0fGVufDF8fHx8MTc2NzU1MjI1OHww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1748551204300-f227d5af350f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXN0YXVyYW50JTIwcGxhdGluZ3xlbnwxfHx8fDE3Njc1NTIyNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1707289516284-c51cf57d22fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwYmFrZXJ5JTIwZGlzcGxheXxlbnwxfHx8fDE3Njc1NTIyNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1668765079998-b9d2b4c5d45c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjYWZlJTIwZXh0ZXJpb3J8ZW58MXx8fHwxNzY3NTUyMjU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  ];

  // Lazy loading with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setLoadedImages((prev) => new Set(prev).add(index));
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    const images = document.querySelectorAll('.gallery-image-container');
    images.forEach((img) => observer.observe(img));

    return () => observer.disconnect();
  }, []);

  const openModal = (index: number) => {
    setSelectedImage(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    
    if (direction === 'prev') {
      setSelectedImage(selectedImage === 0 ? galleryImages.length - 1 : selectedImage - 1);
    } else {
      setSelectedImage(selectedImage === galleryImages.length - 1 ? 0 : selectedImage + 1);
    }
  };

  return (
    <div className="w-full h-full bg-[#252525] relative overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#252525]/95 backdrop-blur-xl border-b border-[#D4AF37]/10">
        <div className="flex items-center justify-center p-6 relative">
          <button 
            onClick={onBack}
            className="absolute left-6 w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors"
          >
            <Home className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
          </button>
          <h2 className="text-white">GALLERY</h2>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="px-6 py-6 pb-8 space-y-4">
        {galleryImages.map((imageUrl, index) => (
          <motion.div
            key={index}
            data-index={index}
            className="gallery-image-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <button
              onClick={() => openModal(index)}
              className="w-full rounded-lg overflow-hidden relative group"
              style={{
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Hover Overlay */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.2) 0%, transparent 70%)',
                }}
              />
              
              {loadedImages.has(index) ? (
                <ImageWithFallback
                  src={imageUrl}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-auto object-cover"
                  style={{
                    aspectRatio: 'auto',
                  }}
                />
              ) : (
                <div 
                  className="w-full bg-[#1a1a1a] animate-pulse"
                  style={{ aspectRatio: '4/3' }}
                />
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeModal}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full z-50"
              style={{
                background: 'rgba(212, 175, 55, 0.2)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
              }}
            >
              <X className="w-6 h-6 text-[#D4AF37]" strokeWidth={2} />
            </button>

            {/* Image Counter */}
            <div className="absolute top-6 left-6 z-50">
              <div 
                className="px-4 py-2 rounded-full"
                style={{
                  background: 'rgba(212, 175, 55, 0.2)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                <span className="text-[#D4AF37] text-sm">
                  {selectedImage + 1} / {galleryImages.length}
                </span>
              </div>
            </div>

            {/* Image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-full max-h-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <ImageWithFallback
                src={galleryImages[selectedImage]}
                alt={`Gallery image ${selectedImage + 1}`}
                className="max-w-full max-h-[calc(100vh-100px)] object-contain rounded-lg"
                style={{
                  boxShadow: '0 24px 48px rgba(212, 175, 55, 0.3)',
                }}
              />

              {/* Navigation Arrows */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('prev');
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-12 h-12 flex items-center justify-center rounded-full"
                style={{
                  background: 'rgba(212, 175, 55, 0.2)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                <span className="text-[#D4AF37] text-2xl">‹</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('next');
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-12 h-12 flex items-center justify-center rounded-full"
                style={{
                  background: 'rgba(212, 175, 55, 0.2)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                <span className="text-[#D4AF37] text-2xl">›</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
