
export const getStatusColor = (status: string) => {
  switch (status) {
    case "published":
      return "default";
    case "draft":
      return "secondary";
    case "review":
      return "destructive";
    default:
      return "outline";
  }
};
