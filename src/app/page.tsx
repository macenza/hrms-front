import Link from "next/link";
import Navbar from "@/components/layout/Navbar";


export default function Home() {
  return (
  <>
    <Navbar/>
    
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      
      <h1>Welcome to HRMS</h1>
      

      <br />
      
      {/* <Link href="/login">Go to Login</Link>
      <br />
      <Link href="/signup">Go to Signup</Link> */}
    </div>
    </>
  );
}
