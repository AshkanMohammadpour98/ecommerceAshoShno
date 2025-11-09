 const tags = [
    "Desktop",
    "MacBook",
    "PC",
    "Watch",
    "USB Cable",
    "Mouse",
    "Windows PC",
    "Monitor",
    "Modem",
    "Ipad"
  ];

  export async function GET() {
    return Response.json(tags)
  }
  export async function POST(){
    return Response.json('added new post method')
  }
  export async function PUT(){
    return Response.json('put posy method')
  }

  // export default function handler(req , res){
  //   res.json('next 1 code')
  // } 
