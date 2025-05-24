'use client';

import { useState } from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
// import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/app/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Search,
  Globe,
  Share2,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  // Link as LinkIcon,
  AlertTriangle,
  Info
} from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { Switch } from '@/app/components/ui/switch';

interface FormValues {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoCanonicalUrl: string;
  ogImage: string;
  noIndex: boolean;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  status: string;
  categoryIds: string[];
  isPremium: boolean;
  publishAt: Date | null;
}

interface SeoSectionProps {
  form: UseFormReturn<FormValues>;
  title: string;
  description: string;
  featuredImage?: string;
}

export function SeoSection({ form, title, description, featuredImage }: SeoSectionProps) {
  const [activeTab, setActiveTab] = useState('google');

  const seoTitle = form.watch('seoTitle') || title;
  const seoDescription = form.watch('seoDescription') || description;
  const seoKeywords = form.watch('seoKeywords') || '';
  const seoCanonicalUrl = form.watch('seoCanonicalUrl') || '';
  const ogImage = form.watch('ogImage') || featuredImage || '';
  const noIndex = form.watch('noIndex') || false;

  // Calculate title length for SEO recommendations
  const titleLength = seoTitle.length;
  const titleStatus =
    titleLength === 0 ? 'empty' :
    titleLength < 30 ? 'short' :
    titleLength <= 60 ? 'good' :
    'long';

  // Calculate description length for SEO recommendations
  const descriptionLength = seoDescription.length;
  const descriptionStatus =
    descriptionLength === 0 ? 'empty' :
    descriptionLength < 70 ? 'short' :
    descriptionLength <= 160 ? 'good' :
    'long';

  // Calculate SEO score
  const calculateSeoScore = () => {
    let score = 0;

    // Title factors (30 points)
    if (titleLength > 0) score += 10; // Has title
    if (titleLength >= 30 && titleLength <= 60) score += 20; // Optimal length
    else if (titleLength > 0) score += 10; // Has title but not optimal length

    // Description factors (30 points)
    if (descriptionLength > 0) score += 10; // Has description
    if (descriptionLength >= 70 && descriptionLength <= 160) score += 20; // Optimal length
    else if (descriptionLength > 0) score += 10; // Has description but not optimal length

    // Keywords factors (10 points)
    if (seoKeywords.length > 0) score += 10;

    // Canonical URL factors (10 points)
    if (seoCanonicalUrl.length > 0) score += 10;

    // OG Image factors (20 points)
    if (ogImage.length > 0) score += 20;

    return score;
  };

  const seoScore = calculateSeoScore();
  const seoScoreColor =
    seoScore >= 80 ? 'text-green-500' :
    seoScore >= 50 ? 'text-yellow-500' :
    'text-red-500';

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="seo">
        <AccordionTrigger className="text-lg font-medium">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              <span>SEO Settings</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">SEO Score:</span>
              <Badge variant={
                seoScore >= 80 ? 'success' :
                seoScore >= 50 ? 'warning' :
                'destructive'
              }>
                {seoScore}%
              </Badge>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6 pt-2">
            <Alert variant={noIndex ? 'warning' : 'default'} className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {noIndex ? 'Search engines will not index this post' : 'SEO Optimization'}
              </AlertTitle>
              <AlertDescription>
                {noIndex
                  ? 'This post will not appear in search engine results. This is useful for private or temporary content.'
                  : 'Optimize your post for search engines to improve visibility and drive more traffic.'}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="seoTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        SEO Title
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">The title that appears in search engine results. If not specified, the post title will be used.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter SEO title (defaults to post title)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="flex items-center justify-between">
                        <span>Optimal length: 30-60 characters</span>
                        <Badge variant={
                          titleStatus === 'empty' ? 'outline' :
                          titleStatus === 'good' ? 'success' :
                          'warning'
                        }>
                          {titleLength} characters ({titleStatus})
                        </Badge>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seoDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Meta Description
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">A brief summary of the page content that appears in search results. If not specified, the post excerpt will be used.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter meta description (defaults to post excerpt)"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="flex items-center justify-between">
                        <span>Optimal length: 70-160 characters</span>
                        <Badge variant={
                          descriptionStatus === 'empty' ? 'outline' :
                          descriptionStatus === 'good' ? 'success' :
                          'warning'
                        }>
                          {descriptionLength} characters ({descriptionStatus})
                        </Badge>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seoKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Meta Keywords
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Keywords related to your content, separated by commas. Less important for modern SEO but still used by some search engines.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter keywords separated by commas"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Example: blogging, writing tips, content creation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seoCanonicalUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Canonical URL
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">The preferred URL for this content if it exists in multiple locations. Helps prevent duplicate content issues.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/your-post"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Only needed if this content appears on multiple URLs
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ogImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Social Media Image
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Custom image URL for social media sharing. If not specified, the featured image will be used.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter image URL for social media"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Recommended size: 1200×630 pixels
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="noIndex"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Prevent Search Indexing
                        </FormLabel>
                        <FormDescription>
                          Exclude this post from search engine results
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      <span>SEO Preview</span>
                    </CardTitle>
                    <CardDescription>
                      How your post might appear in search results and social media
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="google">Google</TabsTrigger>
                        <TabsTrigger value="social">Social Media</TabsTrigger>
                      </TabsList>
                      <TabsContent value="google" className="mt-4">
                        <div className="border rounded-md p-4 space-y-1">
                          <div className="text-blue-600 text-xl font-medium truncate">
                            {seoTitle || "Your Post Title"}
                          </div>
                          <div className="text-green-700 text-sm">
                            example.com/posts/your-post-slug
                          </div>
                          <div className="text-gray-600 text-sm line-clamp-2">
                            {seoDescription || "Your post description will appear here. Make sure to write a compelling description to improve click-through rates."}
                          </div>
                        </div>

                        {noIndex && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="font-medium">This post will not appear in search results</span>
                            </div>
                            <p className="mt-1 text-xs text-yellow-800">You&apos;ve chosen to prevent search engines from indexing this content.</p>
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="social" className="mt-4">
                        <div className="border rounded-md overflow-hidden">
                          <div className="bg-gray-200 h-40 flex items-center justify-center text-gray-500">
                            {ogImage ? (
                              <div className="w-full h-full relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  Social Media Image Preview
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <ImageIcon className="h-6 w-6" />
                                <span>No image specified</span>
                              </div>
                            )}
                          </div>
                          <div className="p-4 space-y-2">
                            <div className="text-sm text-gray-500">example.com</div>
                            <div className="font-bold">
                              {seoTitle || "Your Post Title"}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-3">
                              {seoDescription || "Your post description will appear here when shared on social media platforms."}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 pt-2">
                              <Share2 className="h-4 w-4" />
                              <span>Share</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="mt-6 p-4 border rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">SEO Score</h4>
                        <span className={`font-bold text-lg ${seoScoreColor}`}>{seoScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            seoScore >= 80 ? 'bg-green-500' :
                            seoScore >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${seoScore}%` }}
                        ></div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          {titleStatus === 'good' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="text-sm">
                            {titleStatus === 'good'
                              ? 'Title length is optimal'
                              : titleStatus === 'empty'
                                ? 'Add a title for better SEO'
                                : titleStatus === 'short'
                                  ? 'Title is too short, aim for 30-60 characters'
                                  : 'Title is too long, keep it under 60 characters'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {descriptionStatus === 'good' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="text-sm">
                            {descriptionStatus === 'good'
                              ? 'Description length is optimal'
                              : descriptionStatus === 'empty'
                                ? 'Add a description for better SEO'
                                : descriptionStatus === 'short'
                                  ? 'Description is too short, aim for 70-160 characters'
                                  : 'Description is too long, keep it under 160 characters'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {ogImage ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="text-sm">
                            {ogImage
                              ? 'Social media image is set'
                              : 'Add a social media image for better sharing'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
