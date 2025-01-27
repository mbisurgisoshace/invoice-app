import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectTrigger, SelectValue } from "./ui/select";

export function CreateInvoiceForm() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col gap-1 w-fit">
          <div className="flex items-center gap-4">
            <Badge variant={"secondary"}>Draft</Badge>
            <Input placeholder="Test 123" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <Label>Invoice No.</Label>
            <div className="flex">
              <span className="px-3 border border-r-0 rounded-l-md bg-muted flex items-center">
                #
              </span>
              <Input placeholder="5" className="rounded-l-none" />
            </div>
          </div>

          <div>
            <Label>Currency</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
