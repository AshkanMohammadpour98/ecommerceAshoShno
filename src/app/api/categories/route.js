export const categories = [
    { name: "Desktop", products: 10 },
    { name: "Laptop", products: 12 },
    { name: "Monitor", products: 30 },
    { name: "UPS", products: 23 },
    { name: "Phone", products: 10 },
    { name: "Watch", products: 13 },
    { name: "Mouse", products: 4 },
    { name: "Ipad", products: 2 },
    { name: "Modem", products: 4 },
  ];
  export async function GET() {
    return Response.json(categories)
  }