// Template-specific global declarations
declare global {
  interface Window {
    jQuery: any;
    $: any;
    // Có thể thêm các globals khác của template
    owlCarousel?: any;
    isotope?: any;
  }
}

// Template module declarations
declare module '*.owl-carousel' {
  const content: any;
  export default content;
}

declare module '*.isotope' {
  const content: any;
  export default content;
}

export {};