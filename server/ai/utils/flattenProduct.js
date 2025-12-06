export const flattenProduct = (product) => {
  const stockList = product.variants
    ?.map((v) => `${v.size}: ${v.stock}`)
    .join(" | ");

  const detailsList = product.details
    ?.map((d) => `${d.attribute}: ${d.description}`)
    .join(" | ");

  return `
Product ID: ${product._id}
Title: ${product.title}
Slug: ${product.slug}

Short Description: ${product.shortDescription}
Full Description: ${product.description}

Price:
- List Price: ₹${product.price.list / 100}
- Sale Price: ₹${product.price.sale / 100}
- Discount: ₹${product.price.list - product.price.sale}

Stock By Size:
${stockList}

Rating: ${product.rating?.average}

Tags: ${product.tags?.join(", ")}

Details:
${detailsList}
`;
};
