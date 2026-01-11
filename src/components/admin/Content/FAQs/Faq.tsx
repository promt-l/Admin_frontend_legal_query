import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
} from "@/components/ui/index";
import { Plus, Edit, Trash2 } from "lucide-react";
import { getStatusColor } from "@/utils/status";
import api from "../../../../config/api";
import FaqForm from "./FaqForm";

/* ---------------- TYPES ---------------- */

type FAQ = {
  _id?: string;
  question: string;
  category: string;
  status: "published" | "draft" | "review";
  lastUpdated?: string;
  answer?: string;
};

const emptyFaq: FAQ = {
  question: "",
  category: "Startup",
  status: "draft",
  answer: "",
};

/* ---------------- COMPONENT ---------------- */

export default function FAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqSearch, setFaqSearch] = useState("");
  const [faqDialog, setFaqDialog] = useState<{ open: boolean; faq?: FAQ }>({
    open: false,
  });
  const [loadingFaqs, setLoadingFaqs] = useState(false);

  /* -------- FETCH FAQs -------- */
  useEffect(() => {
    const fetchFaqs = async () => {
      setLoadingFaqs(true);
      try {
        const res = await api.get<FAQ[]>("/faqs", {
          params: faqSearch ? { search: faqSearch } : undefined,
        });
        setFaqs(res.data);
      } catch (err) {
        console.error("Failed to fetch FAQs:", err);
      } finally {
        setLoadingFaqs(false);
      }
    };

    fetchFaqs();
  }, [faqSearch]);

  /* -------- SAVE FAQ (CREATE / UPDATE) -------- */
  const handleSaveFaq = async (faq: FAQ) => {
    try {
      if (faq._id) {
        await api.put(`/faqs/${faq._id}`, faq);
      } else {
        await api.post("/faqs", faq);
      }

      setFaqDialog({ open: false });
      setLoadingFaqs(true);

      const res = await api.get<FAQ[]>("/faqs");
      setFaqs(res.data);
    } catch (err) {
      console.error("Failed to save FAQ:", err);
    } finally {
      setLoadingFaqs(false);
    }
  };

  /* -------- DELETE FAQ -------- */
  const handleDeleteFaq = async (id: string) => {
    try {
      await api.delete(`/faqs/${id}`);
      setFaqs((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error("Failed to delete FAQ:", err);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>FAQ Management</CardTitle>
          <CardDescription>
            Manage frequently asked questions
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <Input
                placeholder="Search FAQs..."
                className="max-w-sm"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
              />
              <Button
                onClick={() =>
                  setFaqDialog({ open: true, faq: emptyFaq })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add FAQ
              </Button>
            </div>

            {loadingFaqs ? (
              <p>Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {faqs.map((faq) => (
                    <TableRow key={faq._id}>
                      <TableCell className="font-medium">
                        {faq.question}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">
                          {faq.category}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={getStatusColor(faq.status)}
                        >
                          {faq.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {faq.lastUpdated
                          ? new Date(
                              faq.lastUpdated
                            ).toLocaleDateString()
                          : ""}
                      </TableCell>

                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setFaqDialog({
                                open: true,
                                faq,
                              })
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleDeleteFaq(faq._id!)
                            }
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
          </div>
        </CardContent>
      </Card>

      {/* -------- FAQ DIALOG -------- */}
      <Dialog
        open={faqDialog.open}
        onOpenChange={(v) =>
          setFaqDialog({ open: v, faq: faqDialog.faq })
        }
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {faqDialog.faq?._id ? "Edit FAQ" : "New FAQ"}
            </DialogTitle>
            <DialogDescription>
              {faqDialog.faq?._id
                ? "Edit FAQ"
                : "Create a new FAQ"}
            </DialogDescription>
          </DialogHeader>

          {faqDialog.faq && (
            <FaqForm
              initial={faqDialog.faq}
              onSave={handleSaveFaq}
              onCancel={() =>
                setFaqDialog({ open: false })
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
