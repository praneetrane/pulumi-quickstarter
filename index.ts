import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { BucketOwnershipControls } from "@pulumi/aws/s3";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.BucketV2("my-bucket");

const ownershipControls = new aws.s3.BucketOwnershipControls(
  "ownership-control",
  {
    bucket: bucket.id,
    rule: {
      objectOwnership: "ObjectWriter",
    },
  }
);

const publicAccessBlock = new aws.s3.BucketPublicAccessBlock(
  "public-access-block",
  {
    bucket: bucket.id,
    blockPublicAcls: false,
  }
);
const website = new aws.s3.BucketWebsiteConfigurationV2("website", {
  bucket: bucket.id,
  indexDocument: {
    suffix: "html",
  },
});

//Create an s3 bucket object
const bucketObject = new aws.s3.BucketObject(
  "index.html",
  {
    bucket: bucket.id,
    source: new pulumi.asset.FileAsset("./index.html"),
    contentType: "text/html",
    acl: "public-read",
  },
  { dependsOn: [publicAccessBlock, ownershipControls, website] }
);

// Export the name of the bucket
//export const bucketName = bucket.id;

// Export bucket endpoint URL
export const bucketEndpoint = pulumi.interpolate`http://${website.websiteEndpoint}/index.html`;
