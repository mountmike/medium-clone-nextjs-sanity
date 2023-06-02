export interface Post {
    _id: string;
    _createdAt: string;
    title: string;
    author: {
        name: string;
        image: image_2;
    };
    description: string;
    mainImage: {
        asset: {
            _ref: string;
            _type: string;
        };
    };
    slug: {
        current: string;
    };
    body: [object]
  }