// import { Button } from "@/components/ui/button";
// import { useNavigate } from "react-router-dom";
// import { LogOut, User, Sun, Moon } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { useEffect, useState } from "react";

// const AdminHeader = () => {
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   const [isDark, setIsDark] = useState(() => {
//     if (typeof window !== 'undefined') {
//       return document.documentElement.classList.contains('dark');
//     }
//     return false;
//   });

//   useEffect(() => {
//     if (isDark) {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//   }, [isDark]);

//   const toggleTheme = () => {
//     setIsDark(!isDark);
//     toast({
//       title: isDark ? "Light mode enabled" : "Night mode enabled",
//       description: isDark ? "Switched to light vision" : "Switched to night vision",
//     });
//   };

//   const handleLogout = () => {
//     toast({
//       title: "Logout clicked",
//       description: "Add your logout logic here",
//     });
//     navigate("/login");
//   };

//   return (
//     <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
//       <div className="flex justify-between items-center h-16">
//         <div className="flex items-center space-x-4">
//           <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
//         </div>
        
//         <div className="flex items-center space-x-4">
//           <div className="flex items-center space-x-2 text-sm text-gray-600">
//             <User className="h-4 w-4" />
//             <span className="hidden sm:inline">Welcome, Admin</span>
//             <span className="sm:hidden">Admin</span>
//           </div>
          
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={toggleTheme}
//             className="flex items-center space-x-2"
//           >
//             {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//             <span className="hidden sm:inline">{isDark ? "Light" : "Night"}</span>
//           </Button>

//           <Button 
//             variant="outline" 
//             size="sm" 
//             onClick={handleLogout}
//             className="flex items-center space-x-2"
//           >
//             <LogOut className="h-4 w-4" />
//             <span className="hidden sm:inline">Logout</span>
//           </Button>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default AdminHeader;