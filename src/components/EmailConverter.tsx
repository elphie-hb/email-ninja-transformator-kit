
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, CopyCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ConversionType = "emailToId" | "idToEmail";

const EmailConverter = () => {
  const [input, setInput] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [output, setOutput] = useState<{ id: string; atId: string; atIdSpace: string; email?: string }[]>([]);
  const [conversionType, setConversionType] = useState<ConversionType>("emailToId");
  const [copied, setCopied] = useState<{ id: boolean; atId: boolean; atIdSpace: boolean; email: boolean; notice: boolean }>({
    id: false,
    atId: false,
    atIdSpace: false,
    email: false,
    notice: false,
  });
  const [noticeOutput, setNoticeOutput] = useState<string>("");
  const idOutputRef = useRef<HTMLTextAreaElement>(null);
  const atIdOutputRef = useRef<HTMLTextAreaElement>(null);
  const atIdSpaceOutputRef = useRef<HTMLTextAreaElement>(null);
  const emailOutputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleConversion = () => {
    if (!input.trim()) {
      return;
    }

    // 줄바꿈, 쉼표, 세미콜론, 공백으로 구분된 여러 항목 처리
    const items = input.split(/[\n,;\s]+/).filter(Boolean);
    const results = items.map((item) => {
      if (conversionType === "emailToId") {
        // 이메일 형식인지 확인
        if (item.includes("@")) {
          const [id] = item.split("@");
          return { 
            id, 
            atId: `@${id}`, 
            atIdSpace: `@${id}`,
            email: item 
          };
        } else {
          // 이미 ID 형식이라면 그대로 사용
          return { 
            id: item, 
            atId: `@${item}`, 
            atIdSpace: `@${item}`,
            email: `${item}@kakaocorp.com` 
          };
        }
      } else {
        // ID를 이메일로 변환
        const id = item.startsWith("@") ? item.substring(1) : item;
        return { 
          id, 
          atId: id.startsWith("@") ? id : `@${id}`, 
          atIdSpace: id.startsWith("@") ? id : `@${id}`,
          email: `${id}@kakaocorp.com` 
        };
      }
    });

    setOutput(results);
    
    // Generate the notice output with proper markdown formatting
    let notice = "";
    
    if (title.trim()) {
      notice += `#${title}\n\n`;
    }
    
    if (description.trim()) {
      notice += `${description}\n\n`;
    }
    
    if (results.length > 0) {
      notice += `>${results.map((item) => item.atIdSpace).join(" ")}`;
    }
    
    setNoticeOutput(notice);
  };

  const copyToClipboard = (type: "id" | "atId" | "atIdSpace" | "email" | "notice") => {
    let ref;
    let content = "";

    switch (type) {
      case "id":
        ref = idOutputRef;
        content = output.map((item) => item.id).join("\n");
        break;
      case "atId":
        ref = atIdOutputRef;
        content = output.map((item) => item.atId).join("\n");
        break;
      case "atIdSpace":
        ref = atIdSpaceOutputRef;
        content = output.map((item) => item.atIdSpace).join(" ");
        break;
      case "email":
        ref = emailOutputRef;
        content = output.map((item) => item.email).join("\n");
        break;
      case "notice":
        content = noticeOutput;
        break;
    }

    if (content) {
      navigator.clipboard.writeText(content).then(
        () => {
          setCopied({ ...copied, [type]: true });
          toast({
            description: "클립보드에 복사되었습니다.",
            duration: 2000,
          });
          
          // 2초 후 복사 상태 초기화
          setTimeout(() => {
            setCopied((prev) => ({ ...prev, [type]: false }));
          }, 2000);
        },
        () => {
          toast({
            description: "복사에 실패했습니다. 다시 시도해주세요.",
            variant: "destructive",
            duration: 2000,
          });
        }
      );
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-6">
      <Card>
        <CardHeader className="bg-blue-50 rounded-t-lg">
          <CardTitle className="text-2xl text-center text-blue-800">텍스트 포맷 변환기</CardTitle>
          <CardDescription className="text-center text-blue-600">
            이메일 ↔ ID 변환 도구
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Tabs 
            defaultValue="emailToId" 
            onValueChange={(value) => setConversionType(value as ConversionType)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="emailToId">이메일 → ID</TabsTrigger>
              <TabsTrigger value="idToEmail">ID → 이메일</TabsTrigger>
            </TabsList>
            
            <TabsContent value="emailToId" className="space-y-4">
              <div>
                <label htmlFor="emailInput" className="block text-sm font-medium mb-2 text-gray-700">
                  이메일 주소 입력 (여러 개는 줄바꿈, 쉼표, 공백으로 구분)
                </label>
                <Textarea
                  id="emailInput"
                  placeholder="예: elphie.hb@kakaocorp.com"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="idToEmail" className="space-y-4">
              <div>
                <label htmlFor="idInput" className="block text-sm font-medium mb-2 text-gray-700">
                  ID 입력 (여러 개는 줄바꿈, 쉼표, 공백으로 구분)
                </label>
                <Textarea
                  id="idInput"
                  placeholder="예: elphie.hb 또는 @elphie.hb"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4 mt-6">
            <div>
              <label htmlFor="noticeTitle" className="block text-sm font-medium mb-2 text-gray-700">
                제목
              </label>
              <Input
                id="noticeTitle"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="noticeDescription" className="block text-sm font-medium mb-2 text-gray-700">
                내용
              </label>
              <Textarea
                id="noticeDescription"
                placeholder="내용을 입력하세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Button onClick={handleConversion} className="bg-blue-600 hover:bg-blue-700">
              변환하기
            </Button>
          </div>
        </CardContent>

        {output.length > 0 && (
          <CardFooter className="flex flex-col space-y-4 border-t pt-6">
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">ID 형식</label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard("id")}
                  className="h-8"
                >
                  {copied.id ? <CopyCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="ml-2">{copied.id ? "복사됨" : "복사"}</span>
                </Button>
              </div>
              <Textarea 
                readOnly 
                ref={idOutputRef}
                value={output.map((item) => item.id).join("\n")} 
                className="min-h-[80px]"
              />
            </div>
            
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">@ID 형식</label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard("atId")}
                  className="h-8"
                >
                  {copied.atId ? <CopyCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="ml-2">{copied.atId ? "복사됨" : "복사"}</span>
                </Button>
              </div>
              <Textarea 
                readOnly 
                ref={atIdOutputRef}
                value={output.map((item) => item.atId).join("\n")} 
                className="min-h-[80px]"
              />
            </div>
            
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">@ID @ID 형식</label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard("atIdSpace")}
                  className="h-8"
                >
                  {copied.atIdSpace ? <CopyCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="ml-2">{copied.atIdSpace ? "복사됨" : "복사"}</span>
                </Button>
              </div>
              <Textarea 
                readOnly 
                ref={atIdSpaceOutputRef}
                value={output.map((item) => item.atIdSpace).join(" ")} 
                className="min-h-[80px]"
              />
            </div>
            
            {conversionType === "idToEmail" && (
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">이메일 형식</label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard("email")}
                    className="h-8"
                  >
                    {copied.email ? <CopyCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span className="ml-2">{copied.email ? "복사됨" : "복사"}</span>
                  </Button>
                </div>
                <Textarea 
                  readOnly 
                  ref={emailOutputRef}
                  value={output.map((item) => item.email).join("\n")} 
                  className="min-h-[80px]"
                />
              </div>
            )}

            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">공지 형식 (마크다운)</label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard("notice")}
                  className="h-8"
                >
                  {copied.notice ? <CopyCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="ml-2">{copied.notice ? "복사됨" : "복사"}</span>
                </Button>
              </div>
              <Textarea 
                value={noticeOutput}
                onChange={(e) => setNoticeOutput(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default EmailConverter;
