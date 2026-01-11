import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Search,
  Plus,
  Edit,
  Trash2,
} from "@/components/ui/index";

import { useEffect, useState } from "react";

import { getStatusColor } from "@/utils/status";
import ArticleForm from "./ArticleForm";

const MyComponent = ({ status }: { status: string }) => {
  return <Badge variant={getStatusColor(status)}>{status}</Badge>;
};

type Article = {
  _id?: string;
  title: string;
  category: string;
  status: "published" | "draft" | "review";
  author: string;
  publishDate?: string;
  views?: number;
  content?: string;
};


const emptyArticle: Article = {
  title: "",
  category: "Startup Legal",
  status: "draft",
  author: "",
  content: "",
};

import { API_URL } from "@/config/api";

export default function Articles(){
    const [articles, setArticles] = useState<Article[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [contentFilter, setContentFilter] = useState("all");
    const [articleDialog, setArticleDialog] = useState<{
        open: boolean;
        article?: Article;
    }>({ open: false });
    const [loadingArticles, setLoadingArticles] = useState(false);

     // === Fetch Articles ===
    useEffect(() => {
        setLoadingArticles(true);
        const params = [];
        if (contentFilter && contentFilter !== "all")
            params.push(`status=${contentFilter}`);
        if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
            fetch(`${API_URL}/articles${params.length ? "?" + params.join("&") : ""}`)
            .then((res) => res.json())
            .then(setArticles)
            .finally(() => setLoadingArticles(false));
    }, [searchTerm, contentFilter]);

    // === Article CRUD ===
    const handleSaveArticle = (article: Article) => {
    const method = article._id ? "PUT" : "POST";
    const url = article._id
      ? `${API_URL}/articles/${article._id}`
      : `${API_URL}/articles`;
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(article),
    }).then(() => {
      setArticleDialog({ open: false });
      setLoadingArticles(true);
      fetch(`${API_URL}/articles`)
        .then((res) => res.json())
        .then(setArticles)
        .finally(() => setLoadingArticles(false));
    });
    };
    const handleDeleteArticle = (id: string) => {
    fetch(`${API_URL}/articles/${id}`, { method: "DELETE" }).then(() =>
      setArticles(articles.filter((a) => a._id !== id))
    );
  };


  return(
    <>
        <Card>
            <CardHeader>
              <CardTitle>Article Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={contentFilter} onValueChange={setContentFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() =>
                    setArticleDialog({ open: true, article: emptyArticle })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Article
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              {loadingArticles ? (
                <p>Loading...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Publish Date</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article) => (
                      <TableRow key={article._id}>
                        <TableCell className="font-medium">
                          {article.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{article.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(article.status)}>
                            {article.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{article.author}</TableCell>
                        <TableCell>
                          {article.publishDate
                            ? new Date(article.publishDate).toLocaleDateString()
                            : "Not published"}
                        </TableCell>
                        <TableCell>{article.views}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setArticleDialog({ open: true, article })
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteArticle(article._id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          {/* --- ARTICLE DIALOG --- */}
          <Dialog
            open={articleDialog.open}
            onOpenChange={(v) =>
              setArticleDialog({ open: v, article: articleDialog.article })
            }
          >
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {articleDialog.article?._id ? "Edit Article" : "New Article"}
                </DialogTitle>
                <DialogDescription>
                  {articleDialog.article?._id
                    ? "Edit article content and settings"
                    : "Create a new article"}
                </DialogDescription>
              </DialogHeader>
              {articleDialog.article && (
                <ArticleForm
                  initial={articleDialog.article}
                  onSave={handleSaveArticle}
                  onCancel={() => setArticleDialog({ open: false })}
                />
              )}
            </DialogContent>
          </Dialog>
    </>
  )
}
