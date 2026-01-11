
'use server';

/**
 * @fileOverview Describes an image using AI.
 *
 * - describeImage - A function that analyzes an image and returns a description.
 * - DescribeImageInput - The input type for the describeImage function.
 * - DescribeImageOutput - The return type for the describeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DescribeImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image to describe, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DescribeImageInput = z.infer<typeof DescribeImageInputSchema>;

const DescribeImageOutputSchema = z.object({
  description: z.string().describe('A concise, SEO-friendly description of the image, suitable for an alt tag.'),
});
export type DescribeImageOutput = z.infer<typeof DescribeImageOutputSchema>;

export async function describeImage(
  input: DescribeImageInput
): Promise<DescribeImageOutput> {
  return describeImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'describeImagePrompt',
  input: {schema: DescribeImageInputSchema},
  output: {schema: DescribeImageOutputSchema},
  prompt: `You are an expert at writing SEO-friendly image alt text.

Analyze the following image and provide a concise, descriptive caption that would be suitable for an HTML alt attribute. Focus on the main subject of the image. The description should be a short sentence.

Image: {{media url=imageDataUri}}`,
});

const describeImageFlow = ai.defineFlow(
  {
    name: 'describeImageFlow',
    inputSchema: DescribeImageInputSchema,
    outputSchema: DescribeImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate a description for the image.');
    }
    return output;
  }
);
