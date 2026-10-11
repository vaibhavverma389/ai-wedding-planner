from typing import List, Dict, Any
from app.schemas.theme import (
    ThemeDiscoveryRequest,
    ThemeDiscoveryResponse,
    ThemeColorPalette
)

def discover_wedding_theme(req: ThemeDiscoveryRequest) -> ThemeDiscoveryResponse:
    """
    Extracts theme characteristics, curated Indian wedding color palettes,
    recommended decor elements, and search keywords from natural language prompts.
    """
    prompt_lower = req.prompt.lower()
    
    if "rajasthan" in prompt_lower or "royal" in prompt_lower or "palace" in prompt_lower or "regal" in prompt_lower:
        return ThemeDiscoveryResponse(
            themeName="Royal Rajputana Heritage",
            description="Opulent palace aesthetics inspired by the royal havelis of Jaipur and Udaipur, featuring deep maroons, antique gold zardozi, brass diyas, and heritage jharokha backdrops.",
            palette=[
                ThemeColorPalette(name="Royal Maroon", hex="#881337"),
                ThemeColorPalette(name="Heritage Gold", hex="#D97706"),
                ThemeColorPalette(name="Antique Brass", hex="#B45309"),
                ThemeColorPalette(name="Raw Silk Cream", hex="#FEF3C7")
            ],
            recommendedDecorElements=[
                "Handcrafted brass Urli bowls with floating marigolds & rose petals",
                "Grand Jharokha Mandap with scalloped Mughal arches",
                "Vintage Rajasthani mirror work textiles and velvet bolster cushions",
                "Fairy light canopies with hanging brass lanterns"
            ],
            suggestedAttireStyles=[
                "Heavy Zardozi Velvet Bridal Lehengas",
                "Raw Silk Achkan & Embroidered Safa for Groom",
                "Polki and Kundan bridal heirloom jewellery"
            ],
            suggestedKeywords=["Royal", "Heritage", "Zardozi", "Palace", "Polki", "Velvet", "Mandap"]
        )
        
    elif "pastel" in prompt_lower or "floral" in prompt_lower or "mehendi" in prompt_lower or "day" in prompt_lower:
        return ThemeDiscoveryResponse(
            themeName="Ethereal Pastel Garden",
            description="Breezy daytime garden celebration featuring soft blush pinks, mint sage, hydrangeas, baby's breath, and modern floral pergolas.",
            palette=[
                ThemeColorPalette(name="Blush Rose", hex="#F472B6"),
                ThemeColorPalette(name="Sage Mint", hex="#86EFAC"),
                ThemeColorPalette(name="Ivory Whispers", hex="#FDFBF7"),
                ThemeColorPalette(name="Soft Peach", hex="#FDBA74")
            ],
            recommendedDecorElements=[
                "Organic botanical Mandap with white wisteria & pastel roses",
                "Rattan cane lounge furniture with floral printed cushions",
                "Aisle lined with acrylic pedestals and wild garden meadow blooms",
                "Personalized acrylic welcome signage with botanical crest"
            ],
            suggestedAttireStyles=[
                "Organza pastel floral embroidered lehengas",
                "Mint green or powder pink bandhgala jacket for Groom",
                "Floral gota patti jewellery for Mehendi ceremony"
            ],
            suggestedKeywords=["Pastel", "Floral", "Organza", "Garden", "Blush", "Rattan", "Hydrangea"]
        )
        
    elif "minimal" in prompt_lower or "modern" in prompt_lower or "ivory" in prompt_lower or "contemporary" in prompt_lower:
        return ThemeDiscoveryResponse(
            themeName="Modern Ivory & Champagne Elegance",
            description="Sophisticated, clutter-free luxury focusing on architectural simplicity, monospaced candlelight, champagne tones, and warm ivory draping.",
            palette=[
                ThemeColorPalette(name="Warm Ivory", hex="#FDFBF7"),
                ThemeColorPalette(name="Champagne Shimmer", hex="#F59E0B"),
                ThemeColorPalette(name="Matte Charcoal", hex="#1F2937"),
                ThemeColorPalette(name="Pearl Lustre", hex="#E5E7EB")
            ],
            recommendedDecorElements=[
                "Minimalist geometric Mandap frame with warm architectural up-lighting",
                "Long banquet tables with continuous tapered candles & white calla lilies",
                "Monochromatic draped fabric ceiling with warm fairy wash",
                "Mirror-finish dance floor with monogram projection"
            ],
            suggestedAttireStyles=[
                "Ivory Chikankari lehenga with tone-on-tone pearl embroidery",
                "Modern tailored charcoal/black tuxedo or ivory Indo-western sherwani",
                "Diamond solitaire and emerald accent jewellery"
            ],
            suggestedKeywords=["Minimalist", "Ivory", "Contemporary", "Champagne", "Candlelight", "Modern"]
        )
        
    else:
        # Classic Festive Indian Wedding
        return ThemeDiscoveryResponse(
            themeName="Classic Auspicious Sindoor & Sona",
            description="Timeless traditional Indian wedding aesthetic honoring centuries of festive celebrations with vibrant sindoor red, sacred marigold orange, and radiant gold.",
            palette=[
                ThemeColorPalette(name="Sindoor Red", hex="#DC2626"),
                ThemeColorPalette(name="Marigold Orange", hex="#EA580C"),
                ThemeColorPalette(name="Temple Gold", hex="#CA8A04"),
                ThemeColorPalette(name="Turmeric Yellow", hex="#FACC15")
            ],
            recommendedDecorElements=[
                "Traditional four-pillar floral Mandap draped in fresh orange and yellow marigolds",
                "Brass bell hanging installations along the bridal walkway",
                "Traditional dhol welcome setup with decorated elephant entry motifs",
                "Bandhani printed backdrop drapes and copper urlis"
            ],
            suggestedAttireStyles=[
                "Classic Red Banarasi or Kanjeevaram silk bridal lehenga/saree",
                "Cream and gold brocade sherwani with red embroidered stole",
                "Temple gold jewellery with rubies and south sea pearls"
            ],
            suggestedKeywords=["Traditional", "Red", "Marigold", "Banarasi", "Mandap", "Temple Gold", "Classic"]
        )
