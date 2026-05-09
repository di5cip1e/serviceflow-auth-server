/**
 * UIAtlas - Manages UI sprites (portraits, icons, overlays)
 * Handles character portraits, trait icons, and counsel interface elements
 */
export class UIAtlas {
  constructor() {
    this.portraits = null;
    this.traitIcons = null;
    this.counselUI = null;
    
    this.portraitsLoaded = false;
    this.iconsLoaded = false;
    this.uiLoaded = false;
    
    this.extractedPortraits = {};
    this.extractedIcons = {};
    
    // Portrait definitions (12 rulers in 3 rows of 4)
    this.portraitDefinitions = [
      // Row 1
      { id: 'stern_king', x: 50, y: 50, width: 200, height: 200, gender: 'male', archetype: 'autocracy' },
      { id: 'cunning_priestess', x: 340, y: 50, width: 200, height: 200, gender: 'female', archetype: 'theocracy' },
      { id: 'charismatic_president', x: 630, y: 50, width: 200, height: 200, gender: 'male', archetype: 'democracy' },
      { id: 'ambitious_warlord', x: 920, y: 50, width: 200, height: 200, gender: 'female', archetype: 'militarism' },
      
      // Row 2
      { id: 'wise_oligarch', x: 50, y: 290, width: 200, height: 200, gender: 'male', archetype: 'oligarchy' },
      { id: 'paranoid_tyrant', x: 340, y: 290, width: 200, height: 200, gender: 'female', archetype: 'autocracy' },
      { id: 'just_judge', x: 630, y: 290, width: 200, height: 200, gender: 'male', archetype: 'democracy' },
      { id: 'merciful_queen', x: 920, y: 290, width: 200, height: 200, gender: 'female', archetype: 'theocracy' },
      
      // Row 3
      { id: 'brilliant_strategist', x: 50, y: 530, width: 200, height: 200, gender: 'male', archetype: 'oligarchy' },
      { id: 'wrathful_barbarian', x: 340, y: 530, width: 200, height: 200, gender: 'female', archetype: 'militarism' },
      { id: 'greedy_merchant', x: 630, y: 530, width: 200, height: 200, gender: 'male', archetype: 'oligarchy' },
      { id: 'slothful_noble', x: 920, y: 530, width: 200, height: 200, gender: 'female', archetype: 'autocracy' }
    ];
    
    // Trait icon definitions (17 icons in 3 rows)
    this.iconDefinitions = {
      // Row 1 - Positive traits
      brilliant: { x: 50, y: 50, width: 128, height: 128 },
      charismatic: { x: 230, y: 50, width: 128, height: 128 },
      decisive: { x: 410, y: 50, width: 128, height: 128 },
      diplomatic: { x: 590, y: 50, width: 128, height: 128 },
      shrewd: { x: 770, y: 50, width: 128, height: 128 },
      just: { x: 950, y: 50, width: 128, height: 128 },
      brave: { x: 1130, y: 50, width: 128, height: 128 },
      
      // Row 2 - Negative traits
      cruel: { x: 50, y: 240, width: 128, height: 128 },
      paranoid: { x: 230, y: 240, width: 128, height: 128 },
      wrathful: { x: 410, y: 240, width: 128, height: 128 },
      slothful: { x: 590, y: 240, width: 128, height: 128 },
      weak_willed: { x: 770, y: 240, width: 128, height: 128 },
      greedy: { x: 950, y: 240, width: 128, height: 128 },
      arrogant: { x: 1130, y: 240, width: 128, height: 128 },
      
      // Row 3 - Special icons
      threaten_token: { x: 150, y: 480, width: 180, height: 180 }, // Larger
      mood_indicator: { x: 500, y: 490, width: 128, height: 128 },
      trust_meter: { x: 800, y: 490, width: 128, height: 128 }
    };
  }
  
  /**
   * Load all UI assets
   */
  async loadAll() {
    const results = await Promise.allSettled([
      this.loadPortraits(),
      this.loadTraitIcons(),
      this.loadCounselUI()
    ]);
    
    const allLoaded = results.every(r => r.status === 'fulfilled');
    console.log('UI Atlas loading:', {
      portraits: this.portraitsLoaded,
      icons: this.iconsLoaded,
      ui: this.uiLoaded
    });
    
    return allLoaded;
  }
  
  /**
   * Load ruler portraits
   */
  async loadPortraits() {
    return new Promise((resolve, reject) => {
      this.portraits = new Image();
      this.portraits.crossOrigin = 'anonymous';
      
      this.portraits.onload = () => {
        console.log('✓ Ruler portraits loaded');
        this.portraitsLoaded = true;
        this.extractPortraits();
        resolve();
      };
      
      this.portraits.onerror = (error) => {
        console.error('✗ Failed to load portraits:', error);
        reject(error);
      };
      
      this.portraits.src = 'https://rosebud.ai/assets/ruler_portraits.png.webp?ZPfV';
    });
  }
  
  /**
   * Load trait icons
   */
  async loadTraitIcons() {
    return new Promise((resolve, reject) => {
      this.traitIcons = new Image();
      this.traitIcons.crossOrigin = 'anonymous';
      
      this.traitIcons.onload = () => {
        console.log('✓ Trait icons loaded');
        this.iconsLoaded = true;
        this.extractIcons();
        resolve();
      };
      
      this.traitIcons.onerror = (error) => {
        console.error('✗ Failed to load trait icons:', error);
        reject(error);
      };
      
      this.traitIcons.src = 'https://rosebud.ai/assets/trait_icons.png.webp?3CNB';
    });
  }
  
  /**
   * Load counsel UI overlay
   */
  async loadCounselUI() {
    return new Promise((resolve, reject) => {
      this.counselUI = new Image();
      this.counselUI.crossOrigin = 'anonymous';
      
      this.counselUI.onload = () => {
        console.log('✓ Counsel UI loaded');
        this.uiLoaded = true;
        resolve();
      };
      
      this.counselUI.onerror = (error) => {
        console.error('✗ Failed to load counsel UI:', error);
        reject(error);
      };
      
      this.counselUI.src = 'https://rosebud.ai/assets/counsel_ui_overlay.png.webp?mZol';
    });
  }
  
  /**
   * Extract portrait sprites
   */
  extractPortraits() {
    this.portraitDefinitions.forEach(def => {
      this.extractedPortraits[def.id] = this.extractSprite(
        this.portraits,
        def.x, def.y, def.width, def.height
      );
    });
    
    console.log(`✓ Extracted ${Object.keys(this.extractedPortraits).length} portraits`);
  }
  
  /**
   * Extract icon sprites
   */
  extractIcons() {
    Object.entries(this.iconDefinitions).forEach(([name, def]) => {
      this.extractedIcons[name] = this.extractSprite(
        this.traitIcons,
        def.x, def.y, def.width, def.height
      );
    });
    
    console.log(`✓ Extracted ${Object.keys(this.extractedIcons).length} icons`);
  }
  
  /**
   * Extract sprite region into canvas
   */
  extractSprite(image, x, y, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    
    return canvas;
  }
  
  /**
   * Get portrait by ID
   */
  getPortrait(portraitId) {
    return this.extractedPortraits[portraitId] || null;
  }
  
  /**
   * Get random portrait matching criteria
   */
  getRandomPortrait(gender = null, archetype = null) {
    let candidates = this.portraitDefinitions;
    
    if (gender) {
      candidates = candidates.filter(p => p.gender === gender);
    }
    
    if (archetype) {
      candidates = candidates.filter(p => p.archetype === archetype);
    }
    
    if (candidates.length === 0) {
      candidates = this.portraitDefinitions; // Fallback to all
    }
    
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    return {
      id: selected.id,
      sprite: this.getPortrait(selected.id),
      data: selected
    };
  }
  
  /**
   * Get trait icon by name
   */
  getTraitIcon(traitName) {
    // Map trait names to icon names
    const iconMap = {
      // Positive traits
      'brilliant': 'brilliant',
      'charismatic': 'charismatic',
      'just': 'just',
      'decisive': 'decisive',
      'diplomatic': 'diplomatic',
      'shrewd': 'shrewd',
      'ambitious': 'brave', // Map to brave (similar)
      'pious': 'just', // Map to just (similar)
      'merciful': 'just', // Map to just (similar)
      'brave': 'brave',
      
      // Negative traits
      'cruel': 'cruel',
      'paranoid': 'paranoid',
      'wrathful': 'wrathful',
      'slothful': 'slothful',
      'weak-willed': 'weak_willed',
      'greedy': 'greedy',
      'arrogant': 'arrogant',
      'hateful': 'wrathful', // Map to wrathful (similar)
      'impulsive': 'wrathful', // Map to wrathful (similar)
      'stubborn': 'arrogant' // Map to arrogant (similar)
    };
    
    const iconName = iconMap[traitName.toLowerCase()] || traitName;
    return this.extractedIcons[iconName] || null;
  }
  
  /**
   * Get threaten token icon
   */
  getThreatenToken() {
    return this.extractedIcons['threaten_token'] || null;
  }
  
  /**
   * Get mood indicator icon
   */
  getMoodIndicator() {
    return this.extractedIcons['mood_indicator'] || null;
  }
  
  /**
   * Get trust meter icon
   */
  getTrustMeter() {
    return this.extractedIcons['trust_meter'] || null;
  }
  
  /**
   * Draw portrait in circular frame
   */
  drawPortrait(ctx, portraitId, x, y, radius) {
    const portrait = this.getPortrait(portraitId);
    if (!portrait) return;
    
    ctx.save();
    
    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();
    
    // Draw portrait scaled to fit circle
    const size = radius * 2;
    ctx.drawImage(portrait, x - radius, y - radius, size, size);
    
    ctx.restore();
    
    // Draw circular border
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  /**
   * Draw trait icon
   */
  drawTraitIcon(ctx, traitName, x, y, size) {
    const icon = this.getTraitIcon(traitName);
    if (!icon) return;
    
    const halfSize = size / 2;
    ctx.drawImage(icon, x - halfSize, y - halfSize, size, size);
  }
  
  /**
   * Create portrait element for DOM
   */
  createPortraitElement(portraitId, size = 100) {
    const portrait = this.getPortrait(portraitId);
    if (!portrait) return null;
    
    const container = document.createElement('div');
    container.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid #c9a86a;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      background: #1a1a1a;
    `;
    
    const img = document.createElement('img');
    img.src = portrait.toDataURL();
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
    `;
    
    container.appendChild(img);
    return container;
  }
  
  /**
   * Create trait icon element for DOM
   */
  createTraitIconElement(traitName, size = 48) {
    const icon = this.getTraitIcon(traitName);
    if (!icon) return null;
    
    const img = document.createElement('img');
    img.src = icon.toDataURL();
    img.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      display: inline-block;
    `;
    img.title = traitName;
    
    return img;
  }
  
  /**
   * Check if all assets are ready
   */
  isReady() {
    return this.portraitsLoaded && this.iconsLoaded && this.uiLoaded;
  }
  
  /**
   * Check if portraits are ready
   */
  hasPortraits() {
    return this.portraitsLoaded && Object.keys(this.extractedPortraits).length > 0;
  }
  
  /**
   * Check if icons are ready
   */
  hasIcons() {
    return this.iconsLoaded && Object.keys(this.extractedIcons).length > 0;
  }
}
